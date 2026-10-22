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

module.exports = router;
