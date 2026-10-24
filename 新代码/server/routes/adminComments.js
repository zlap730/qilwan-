// File: server/routes/adminComments.js
// 作用：评论审核接口（给后续的「管理员页面」用）。
// 挂载位置：/api/admin/comments
//
// 说明：现在前端还没有管理页面，但接口和字段已经就位，
//       以后只要写一个页面调这些接口即可，不用再动后端。
//
//   GET    /stats                       各审核状态的数量
//   GET    /?status=pending&page=1      评论列表（含作者、媒体、回复关系）
//   PATCH  /:id/review                  审核：{ auditStatus: 'approved' | 'rejected', reviewNote }
//   POST   /:id/hide                    快速隐藏（= 软删除，管理员可用）

const express = require('express');
const { Comment, CommentImage, User } = require('../models');
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/admin');

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

// 各状态数量：给管理页顶部的统计卡片用
router.get('/stats', async (req, res) => {
  try {
    const [pending, approved, rejected, hidden] = await Promise.all([
      Comment.count({ where: { auditStatus: 'pending', status: 'active' } }),
      Comment.count({ where: { auditStatus: 'approved', status: 'active' } }),
      Comment.count({ where: { auditStatus: 'rejected', status: 'active' } }),
      Comment.count({ where: { status: 'deleted' } })
    ]);
    res.json({ pending, approved, rejected, hidden });
  } catch (err) {
    res.status(500).json({ error: '读取审核统计失败', details: err.message });
  }
});

// 评论列表：可按审核状态筛选、分页
router.get('/', async (req, res) => {
  try {
    const { status = 'pending', page = 1, pageSize = 20, keyword = '' } = req.query;
    const where = {};
    if (status !== 'all') where.auditStatus = status;
    if (keyword) {
      where.content = { [require('sequelize').Op.like]: `%${keyword}%` };
    }

    const size = Math.min(Number(pageSize) || 20, 100);
    const offset = (Math.max(Number(page) || 1, 1) - 1) * size;

    const { rows, count } = await Comment.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: size,
      offset
    });

    const ids = rows.map((item) => item.id);
    const media = ids.length
      ? await CommentImage.findAll({ where: { commentId: ids, status: 'active' } })
      : [];
    const users = await User.findAll({ attributes: ['id', 'username', 'avatar'] });
    const userMap = Object.fromEntries(users.map((user) => [user.id, user]));

    const mediaMap = {};
    for (const item of media) {
      if (!mediaMap[item.commentId]) mediaMap[item.commentId] = [];
      mediaMap[item.commentId].push({ id: item.id, url: item.imageUrl, type: item.mediaType });
    }

    res.json({
      total: count,
      page: Number(page) || 1,
      pageSize: size,
      items: rows.map((item) => ({
        id: item.id,
        content: item.content,
        status: item.status,
        auditStatus: item.auditStatus,
        reviewNote: item.reviewNote,
        reviewedAt: item.reviewedAt,
        parentId: item.parentId,
        rootId: item.rootId,
        targetId: item.targetId,
        created_at: item.created_at,
        author: userMap[item.authorId] || { id: item.authorId, username: '未知用户' },
        media: mediaMap[item.id] || []
      }))
    });
  } catch (err) {
    res.status(500).json({ error: '读取评论列表失败', details: err.message });
  }
});

// 审核：通过 / 驳回
router.patch('/:id/review', async (req, res) => {
  try {
    const { auditStatus, reviewNote = '' } = req.body || {};
    if (!['approved', 'rejected', 'pending'].includes(auditStatus)) {
      return res.status(400).json({ error: 'auditStatus 只能是 approved / rejected / pending' });
    }

    const comment = await Comment.findByPk(req.params.id);
    if (!comment) return res.status(404).json({ error: '评论不存在' });

    await comment.update({
      auditStatus,
      reviewNote: String(reviewNote).slice(0, 200),
      reviewedAt: new Date(),
      reviewedBy: req.user.id
    });

    res.json({
      id: comment.id,
      auditStatus: comment.auditStatus,
      reviewNote: comment.reviewNote,
      reviewedAt: comment.reviewedAt
    });
  } catch (err) {
    res.status(500).json({ error: '审核失败', details: err.message });
  }
});

// 快速隐藏（软删除）
router.post('/:id/hide', async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) return res.status(404).json({ error: '评论不存在' });

    const replies = comment.parentId
      ? []
      : await Comment.findAll({ where: { rootId: comment.id }, attributes: ['id'] });
    const ids = [comment.id, ...replies.map((item) => item.id)];

    await Comment.update({ status: 'deleted' }, { where: { id: ids } });
    await CommentImage.update({ status: 'deleted' }, { where: { commentId: ids } });

    res.json({ message: '已隐藏', hidden: ids.length });
  } catch (err) {
    res.status(500).json({ error: '隐藏失败', details: err.message });
  }
});

module.exports = router;
