// File: server/routes/adminUsers.js
// 作用：后台「用户管理」接口。挂载位置：/api/admin/users（全部要求管理员身份）
//
//   GET    /                 用户列表（分页 + 关键字搜索，附带每人评论数）
//   GET    /stats            顶部统计（用户总数 / 管理员数 / 今日新增）
//   PATCH  /:id/admin        设为 / 取消管理员 { isAdmin: true|false }
//   POST   /:id/reset-password  重置密码 { password }（管理员帮用户改密码）
//   DELETE /:id              删除用户（连带其评论与媒体，和前台注销一致）

const express = require('express');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const { User, Comment, CommentImage } = require('../models');
const sequelize = require('../config/database');
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/admin');

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

// 用户列表
router.get('/', async (req, res) => {
  try {
    const { keyword = '', page = 1, pageSize = 10 } = req.query;
    const size = Math.min(Number(pageSize) || 10, 100);
    const offset = (Math.max(Number(page) || 1, 1) - 1) * size;

    const where = {};
    if (keyword) {
      where[Op.or] = [
        { username: { [Op.like]: `%${keyword}%` } },
        { email: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const { rows, count } = await User.findAndCountAll({
      where,
      attributes: ['id', 'username', 'email', 'avatar', 'bio', 'isAdmin', 'created_at'],
      order: [['created_at', 'DESC']],
      limit: size,
      offset
    });

    // 每人评论数：一次 group by 查完，避免 N+1
    const ids = rows.map((user) => user.id);
    const counts = ids.length
      ? await Comment.findAll({
          where: { authorId: ids },
          attributes: ['authorId', [sequelize.fn('COUNT', sequelize.col('id')), 'n']],
          group: ['authorId'],
          raw: true
        })
      : [];
    const countMap = Object.fromEntries(counts.map((item) => [item.authorId, Number(item.n)]));

    res.json({
      total: count,
      page: Number(page) || 1,
      pageSize: size,
      items: rows.map((user) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        isAdmin: Boolean(user.isAdmin),
        created_at: user.created_at,
        commentCount: countMap[user.id] || 0
      }))
    });
  } catch (err) {
    res.status(500).json({ error: '读取用户列表失败', details: err.message });
  }
});

// 顶部统计
router.get('/stats', async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [users, admins, today] = await Promise.all([
      User.count(),
      User.count({ where: { isAdmin: true } }),
      User.count({ where: { created_at: { [Op.gte]: startOfDay } } })
    ]);

    res.json({ users, admins, today });
  } catch (err) {
    res.status(500).json({ error: '读取统计失败', details: err.message });
  }
});

// 设为 / 取消管理员
router.patch('/:id/admin', async (req, res) => {
  try {
    const { isAdmin } = req.body || {};
    if (typeof isAdmin !== 'boolean') {
      return res.status(400).json({ error: 'isAdmin 必须是 true 或 false' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: '用户不存在' });

    // 防止把自己降权后进不去后台
    if (!isAdmin && user.id === req.user.id) {
      return res.status(400).json({ error: '不能取消自己的管理员权限' });
    }

    await user.update({ isAdmin });
    res.json({ id: user.id, username: user.username, isAdmin: Boolean(user.isAdmin) });
  } catch (err) {
    res.status(500).json({ error: '修改管理员权限失败', details: err.message });
  }
});

// 管理员帮用户重置密码
router.post('/:id/reset-password', async (req, res) => {
  try {
    const password = String(req.body?.password || '');
    if (password.length < 6) {
      return res.status(400).json({ error: '新密码至少 6 位' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: '用户不存在' });

    await user.update({ password: await bcrypt.hash(password, 10) });
    res.json({ message: `已重置 ${user.username} 的密码` });
  } catch (err) {
    res.status(500).json({ error: '重置密码失败', details: err.message });
  }
});

// 删除用户（连带评论与媒体，和前台注销同一套逻辑）
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: '用户不存在' });
    if (user.id === req.user.id) {
      return res.status(400).json({ error: '不能删除自己的账号' });
    }

    await sequelize.transaction(async (transaction) => {
      const comments = await Comment.findAll({ where: { authorId: user.id }, attributes: ['id'], transaction });
      const commentIds = comments.map((item) => item.id);
      if (commentIds.length) {
        await CommentImage.destroy({ where: { commentId: commentIds }, transaction });
        await Comment.destroy({ where: { authorId: user.id }, transaction });
      }
      await user.destroy({ transaction });
    });

    res.json({ message: '用户已删除' });
  } catch (err) {
    res.status(500).json({ error: '删除用户失败', details: err.message });
  }
});

module.exports = router;
