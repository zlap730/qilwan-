// File: server/routes/auth.js
// 作用：账号相关接口。注册、登录、取当前用户、检查登录态。
// 挂载位置：/api/auth
// 迁移改动：① 响应里不再带 password；② 默认头像改成真实存在的 /uploads/default_avatar.png；
//          ③ Cookie 里也不再塞密码哈希；④ 登录后的跳转提示改成 SPA 首页。

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const Sequelize = require('sequelize');
const authMiddleware = require('../middlewares/auth');
const { toPublicUser } = require('../utils/publicUser');
const { body, validationResult } = require('express-validator');

const router = express.Router();

router.post('/register', [
    body('username')
        .trim()
        .notEmpty().withMessage('用户名不能为空')
        .isLength({ min: 3, max: 30 }).withMessage('用户名长度应为3-30个字符')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('用户名只能包含字母、数字和下划线'),
    body('password')
        .notEmpty().withMessage('密码不能为空')
        .isLength({ min: 6, max: 100 }).withMessage('密码长度至少6位'),
    body('email')
        .trim()
        .notEmpty().withMessage('邮箱不能为空')
        .isEmail().withMessage('邮箱格式不正确')
        .normalizeEmail(),
    body('bio')
        .optional({ checkFalsy: true })
        .trim()
        .escape()
        .isLength({ max: 200 }).withMessage('简介最多200个字符')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: '注册输入校验失败',
            details: errors.array().map(item => item.msg)
        });
    }

    const { username, password, email, bio } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            username,
            password: hashedPassword,
            email,
            bio,
            // 旧代码写的是 /img/图标文件/默认头像.png，这个文件并不存在（新用户头像必裂）
            avatar: '/uploads/default_avatar.png'
        });
        res.status(201).json(toPublicUser(user));
    } catch (err) {
        let detailMessage = '';
        if (err && err.errors && Array.isArray(err.errors)) {
            detailMessage = err.errors.map(e => e.message).join('，');
        } else if (err instanceof Error) {
            detailMessage = err.message;
        } else if (typeof err === 'object') {
            detailMessage = JSON.stringify(err);
        } else {
            detailMessage = String(err);
        }

        res.status(400).json({
            error: '注册失败',
            details: detailMessage
        });
    }
});

// 用户登录接口
router.post('/login', async (req, res) => {
    const { identifier, password } = req.body;
    try {
        const user = await User.findOne({
            where: {
                [Sequelize.Op.or]: [{ username: identifier }, { email: identifier }]
            }
        });
        if (!user) return res.status(404).json({ error: '用户不存在' });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ error: '密码错误' });

        // 生成 JWT
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' }); // 设置 JWT 有效期为 7 天

        // 设置 Cookie（只放可以公开的字段，密码哈希不出网）
        res.cookie('user', JSON.stringify(toPublicUser(user)), {
            httpOnly: false, // 旧页面要靠 document.cookie 读取，先保持兼容；新前端只用 JWT
            maxAge: 604800000, // 7 天有效
            path: '/' // 确保路径为根路径
        });
        res.json({ token, user: toPublicUser(user), redirect: '/' });
    } catch (err) {
        res.status(500).json({ error: '登录失败', details: err });
    }
});

// 获取当前用户信息接口
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ error: '用户不存在' });
        res.json(toPublicUser(user));
    } catch (err) {
        res.status(500).json({ error: '获取用户信息失败', details: err.message });
    }
});

router.get('/check-login', (req, res) => {
    const userCookie = req.cookies.user;
    if (!userCookie) {
        return res.status(401).json({ error: '未登录' });
    }

    try {
        res.json({ user: toPublicUser(JSON.parse(userCookie)) });
    } catch {
        res.status(401).json({ error: '登录信息已损坏，请重新登录' });
    }
});

// ────────────────────────────────────────────────────────────
// 找回密码（邮箱验证码）
// 流程：POST /forgot-password 发验证码 → POST /reset-password 校验并改密
// 安全约定：① 不暴露邮箱是否注册；② 同一账号 60 秒内只能发一次；
//          ③ 验证码 10 分钟过期、最多试 5 次、用过即失效；④ 库里只存哈希。
// ────────────────────────────────────────────────────────────

const crypto = require('crypto');
const { PasswordReset } = require('../models');
const { sendResetCode, isConfigured: mailConfigured } = require('../utils/mailer');

const RESET_TTL_MS = 10 * 60 * 1000; // 验证码有效期 10 分钟
const RESET_COOLDOWN_MS = 60 * 1000; // 同一账号再次发送的间隔
const RESET_MAX_ATTEMPTS = 5; // 最多验证失败次数

// 生成 6 位数字验证码
function createCode() {
    return String(crypto.randomInt(0, 1000000)).padStart(6, '0');
}

router.post('/forgot-password', [
    body('email')
        .trim()
        .notEmpty().withMessage('请输入邮箱')
        .isEmail().withMessage('邮箱格式不正确')
        .normalizeEmail()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: '输入校验失败', details: errors.array().map(item => item.msg) });
    }

    const { email } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        // 无论邮箱是否存在都返回同样的提示，避免被用来探测账号
        const genericMessage = '如果该邮箱已注册，验证码已发送，请查收（含垃圾邮件箱）';
        if (!user) return res.json({ message: genericMessage, delivered: false });

        // 冷却时间：防止被当成短信轰炸工具
        const latest = await PasswordReset.findOne({
            where: { userId: user.id },
            order: [['created_at', 'DESC']]
        });
        if (latest && Date.now() - new Date(latest.created_at).getTime() < RESET_COOLDOWN_MS) {
            return res.status(429).json({ error: '发送太频繁，请 1 分钟后再试' });
        }

        const code = createCode();
        const codeHash = await bcrypt.hash(code, 10);

        await PasswordReset.create({
            userId: user.id,
            codeHash,
            expiresAt: new Date(Date.now() + RESET_TTL_MS)
        });

        const result = await sendResetCode(email, code);

        // 开发模式（没配 SMTP）把验证码回传给前端，方便本地走通流程；配置后不再返回
        const payload = { message: genericMessage, delivered: result.delivered };
        if (!mailConfigured) {
            payload.devCode = code;
            payload.hint = '当前后端未配置 SMTP，验证码只打印在服务端控制台，已通过 devCode 返回（仅开发用）';
        }

        res.json(payload);
    } catch (err) {
        console.error('发送找回密码验证码失败:', err);
        res.status(500).json({ error: '发送验证码失败，请稍后重试' });
    }
});

router.post('/reset-password', [
    body('email').trim().notEmpty().isEmail().withMessage('邮箱格式不正确').normalizeEmail(),
    body('code').trim().notEmpty().isLength({ min: 6, max: 6 }).withMessage('验证码为 6 位数字'),
    body('password').notEmpty().isLength({ min: 6, max: 100 }).withMessage('新密码长度至少6位')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: '输入校验失败', details: errors.array().map(item => item.msg) });
    }

    const { email, code, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(400).json({ error: '验证码无效或已过期' });

        const record = await PasswordReset.findOne({
            where: {
                userId: user.id,
                usedAt: null,
                expiresAt: { [Sequelize.Op.gt]: new Date() }
            },
            order: [['created_at', 'DESC']]
        });
        if (!record) return res.status(400).json({ error: '验证码无效或已过期，请重新获取' });

        if (record.attempts >= RESET_MAX_ATTEMPTS) {
            return res.status(429).json({ error: '验证码错误次数过多，请重新获取' });
        }

        const ok = await bcrypt.compare(code, record.codeHash);
        if (!ok) {
            await record.update({ attempts: record.attempts + 1 });
            return res.status(400).json({ error: '验证码不正确' });
        }

        // 改密码 + 作废该用户其它未使用的验证码
        await user.update({ password: await bcrypt.hash(password, 10) });
        await record.update({ usedAt: new Date() });
        await PasswordReset.update(
            { usedAt: new Date() },
            { where: { userId: user.id, usedAt: null } }
        );

        res.json({ message: '密码已重置，请用新密码登录' });
    } catch (err) {
        console.error('重置密码失败:', err);
        res.status(500).json({ error: '重置密码失败，请稍后重试' });
    }
});

module.exports = router;
