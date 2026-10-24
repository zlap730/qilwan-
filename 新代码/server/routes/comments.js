// File: server/routes/comments.js
// 作用：讨论区接口。
//   GET    /            全部评论（按「顶层 + 楼中楼」返回，只给通过审核的）
//   POST   /            发评论 / 回复（最多 9 张图 + 1 个视频）
//   GET    /:targetId   某个页面/目标的评论树
//   PATCH  /:id         编辑自己的评论
//   DELETE /:id         软删除（连带它的回复一起删）
//   POST   /:commentId/images  给已有评论补图（旧接口保留）
//
// 本次升级（相对旧站）：
//   ① 楼中楼：评论可以回复别人的评论（parentId / rootId），前端显示「回复 @某人」；
//   ② 多图：一条评论最多 9 张（images 字段，multipart 可传多个）；
//   ③ 视频：一条评论最多 1 个，≤50MB（video 字段）；
//   ④ 审核：新增 auditStatus（pending / approved / rejected），
//      开关在 server/.env 的 COMMENT_AUDIT=true —— 打开后新评论先变 pending，
//      公开列表只显示 approved，管理员通过 /api/admin/comments 审核。
//      现在默认关闭，行为和以前一致（发出来就能看到）。

const express = require('express');
const { Comment, CommentImage, User } = require('../models');
const authMiddleware = require('../middlewares/auth');
const upload = require('../middlewares/upload');

const router = express.Router();

// 先审后发开关：.env 里 COMMENT_AUDIT=true 时新评论进入待审
const AUDIT_ENABLED = process.env.COMMENT_AUDIT === 'true';
const MAX_IMAGES = 9;

// 把评论 + 图片 + 作者拼成前端要的结构
async function buildTree(rawComments, { targetId } = {}) {
  const comments = rawComments.filter((item) => item.status === 'active');

  const ids = comments.map((item) => item.id);
  const images = ids.length
    ? await CommentImage.findAll({
        where: { commentId: ids, status: 'active' },
        order: [['id', 'ASC']]
      })
    : [];

  const userIds = [...new Set(comments.map((item) => item.authorId))];
  const users = userIds.length
    ? await User.findAll({ where: { id: userIds }, attributes: ['id', 'username', 'avatar'] })
    : [];
  const userMap = Object.fromEntries(users.map((user) => [user.id, user]));

  const mediaByComment = {};
  for (const media of images) {
    if (!mediaByComment[media.commentId]) mediaByComment[media.commentId] = [];
    mediaByComment[media.commentId].push({
      id: media.id,
      url: media.imageUrl,
      type: media.mediaType || 'image',
      filename: media.filename
    });
  }

  // 被回复的人（楼中楼显示「回复 @xxx」）
  const parentIds = [...new Set(comments.map((item) => item.parentId).filter(Boolean))];
  const parents = parentIds.length
    ? await Comment.findAll({ where: { id: parentIds }, attributes: ['id', 'authorId'] })
    : [];
  const parentAuthorMap = Object.fromEntries(parents.map((item) => [item.id, item.authorId]));

  const format = (item) => {
    const author = userMap[item.authorId] || { id: item.authorId, username: '未知用户' };
    const replyToId = parentAuthorMap[item.parentId];
    const replyToUser = replyToId ? userMap[replyToId] : null;

    return {
      id: item.id,
      content: item.content || '',
      image: item.image,
      videoUrl: item.videoUrl,
      targetId: item.targetId,
      parentId: item.parentId,
      rootId: item.rootId,
      status: item.status,
      auditStatus: item.auditStatus,
      created_at: item.created_at,
      User: { id: author.id, username: author.username, avatar: author.avatar },
      CommentImages: mediaByComment[item.id] || [],
      replyTo: replyToUser ? { id: replyToUser.id, username: replyToUser.username } : null
    };
  };

  // 顶层 + 子回复
  const tops = comments
    .filter((item) => !item.parentId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return tops.map((top) => {
    const node = format(top);
    node.replies = comments
      .filter((item) => item.rootId === top.id && item.parentId)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .map(format);
    return node;
  });
}

// 公开列表：只看通过审核的
function publicWhere(extra = {}) {
  return { status: 'active', auditStatus: 'approved', ...extra };
}

// 获取所有评论（顶层 + 回复）
router.get('/', async (req, res) => {
  try {
    const comments = await Comment.findAll({
      where: publicWhere(),
      order: [['created_at', 'DESC']]
    });
    res.json(await buildTree(comments));
  } catch (err) {
    console.error('获取评论失败:', err);
    res.status(500).json({ error: '获取评论失败', details: err.message });
  }
});

// 发评论 / 回复（multipart：content、targetId、parentId、images[]、video）
router.post(
  '/',
  authMiddleware,
  upload.media.fields([
    { name: 'images', maxCount: MAX_IMAGES },
    { name: 'video', maxCount: 1 }
  ]),
  upload.checkMediaSizes,
  async (req, res) => {
    try {
      const { content, targetId, parentId } = req.body;
      const userId = req.user.id;
      const images = req.files?.images || [];
      const videos = req.files?.video || [];

      const text = (content || '').trim();
      if (!text && images.length === 0 && videos.length === 0) {
        return res.status(400).json({ error: '评论内容不能为空（至少写点文字或传一张图）' });
      }
      if (text.length > 1000) {
        return res.status(400).json({ error: '评论内容最多 1000 字' });
      }

      // 回复：校验被回复的评论存在，并算出 rootId
      let rootId = null;
      let replyToUserId = null;
      if (parentId) {
        const parent = await Comment.findByPk(parentId);
        if (!parent || parent.status !== 'active') {
          return res.status(404).json({ error: '要回复的评论不存在或已删除' });
        }
        rootId = parent.rootId || parent.id;
        replyToUserId = parent.authorId;
      }

      const comment = await Comment.create({
        content: text || null,
        targetId: targetId || 'default',
        authorId: userId,
        parentId: parentId || null,
        rootId,
        // 第一张图沿用旧字段 comment.image，保持旧数据/旧前端兼容
        image: images.length ? `/uploads/${images[0].filename}` : null,
        videoUrl: videos.length ? `/uploads/${videos[0].filename}` : null,
        status: 'active',
        auditStatus: AUDIT_ENABLED ? 'pending' : 'approved'
      });

      // 图片、视频都写进 commentimages，用 mediaType 区分
      const mediaRows = [
        ...images.map((file) => ({
          commentId: comment.id,
          imageUrl: `/uploads/${file.filename}`,
          filename: file.originalname,
          mimeType: file.mimetype,
          fileSize: file.size,
          mediaType: 'image',
          status: 'active'
        })),
        ...videos.map((file) => ({
          commentId: comment.id,
          imageUrl: `/uploads/${file.filename}`,
          filename: file.originalname,
          mimeType: file.mimetype,
          fileSize: file.size,
          mediaType: 'video',
          status: 'active'
        }))
      ];
      if (mediaRows.length) await CommentImage.bulkCreate(mediaRows);

      res.status(201).json({
        id: comment.id,
        content: comment.content,
        image: comment.image,
        videoUrl: comment.videoUrl,
        parentId: comment.parentId,
        rootId: comment.rootId,
        auditStatus: comment.auditStatus,
        created_at: comment.created_at,
        authorId: userId,
        replyToUserId,
        // 前端据此提示「已提交，等待审核」
        pendingAudit: comment.auditStatus === 'pending'
      });
    } catch (err) {
      console.error('创建评论失败 - 详细错误:', err);
      res.status(500).json({ error: '创建评论失败', details: err.message });
    }
  }
);

// 获取某个目标下的评论树
router.get('/:targetId', async (req, res) => {
  try {
    const comments = await Comment.findAll({
      where: publicWhere({ targetId: req.params.targetId }),
      order: [['created_at', 'DESC']]
    });
    res.json(await buildTree(comments, { targetId: req.params.targetId }));
  } catch (err) {
    console.error('获取评论失败:', err);
    res.status(500).json({ error: '获取评论失败', details: err.message });
  }
});

// 删除评论（软删除，连带它的回复一起标记删除，避免出现孤儿子楼层）
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) return res.status(404).json({ error: '评论不存在' });

    // 管理员也能删（后续管理页面用）
    if (comment.authorId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ error: '无权删除此评论' });
    }

    // 顶层评论：连同它的所有回复
    const replies = comment.parentId
      ? []
      : await Comment.findAll({ where: { rootId: comment.id }, attributes: ['id'] });
    const ids = [comment.id, ...replies.map((item) => item.id)];

    await Comment.update({ status: 'deleted' }, { where: { id: ids } });
    await CommentImage.update({ status: 'deleted' }, { where: { commentId: ids } });

    res.json({ message: '评论已删除', deleted: ids.length });
  } catch (err) {
    console.error('删除评论失败:', err);
    res.status(500).json({ error: '删除评论失败', details: err.message });
  }
});

// 编辑自己的评论（个人中心 → 评论管理）
// 只允许改正文，且只能改自己的、未被删除的评论
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const content = String(req.body?.content ?? '').trim();

    if (!content) return res.status(400).json({ error: '评论内容不能为空' });
    if (content.length > 1000) return res.status(400).json({ error: '评论内容最多 1000 字' });

    const comment = await Comment.findByPk(req.params.id);
    if (!comment) return res.status(404).json({ error: '评论不存在' });
    if (comment.status !== 'active') return res.status(400).json({ error: '这条评论已删除，无法编辑' });
    if (comment.authorId !== req.user.id) return res.status(403).json({ error: '只能编辑自己的评论' });

    // 开了先审后发时，编辑后要重新审
    await comment.update({
      content,
      auditStatus: AUDIT_ENABLED ? 'pending' : comment.auditStatus
    });

    res.json({
      id: comment.id,
      content: comment.content,
      auditStatus: comment.auditStatus,
      created_at: comment.created_at,
      updated_at: comment.updated_at
    });
  } catch (err) {
    console.error('编辑评论失败:', err);
    res.status(500).json({ error: '编辑评论失败', details: err.message });
  }
});

// 给已有评论补图（旧接口保留，单张）
router.post('/:commentId/images', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.commentId);
    if (!comment) return res.status(404).json({ error: '评论不存在' });
    if (comment.authorId !== req.user.id) {
      return res.status(403).json({ error: '无权为此评论上传图片' });
    }
    if (!req.file) return res.status(400).json({ error: '没有收到图片文件' });

    const image = await CommentImage.create({
      commentId: comment.id,
      imageUrl: `/uploads/${req.file.filename}`,
      filename: req.file.originalname,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      mediaType: 'image',
      status: 'active'
    });

    res.status(201).json({ id: image.id, imageUrl: image.imageUrl, mediaType: 'image' });
  } catch (err) {
    console.error('上传评论图片失败:', err);
    res.status(500).json({ error: '上传评论图片失败', details: err.message });
  }
});

module.exports = router;
