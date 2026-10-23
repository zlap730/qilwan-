// File: server/routes/comments.js
// 作用：讨论区接口。评论列表、发评论（可带图）、按目标取评论、软删除、单独传图。
// 挂载位置：/api/comments
// 迁移改动：图片地址从 http://localhost:3000/uploads/xxx 改成 /uploads/xxx，
//          否则换域名或换端口后，数据库里的历史图片全部 404。

const express = require('express');
const { Comment, CommentImage, User } = require('../models');
const authMiddleware = require('../middlewares/auth');
const upload = require('../middlewares/upload');

const router = express.Router();

// 获取所有评论（前端需要的端点）- 简化版，不使用include
router.get('/', async (req, res) => {
  try {
    // 获取所有评论
    const comments = await Comment.findAll({
      where: { status: 'active' },
      order: [['created_at', 'DESC']]
    });
    
    // 获取所有评论图片
    const commentIds = comments.map(comment => comment.id);
    const commentImages = await CommentImage.findAll({
      where: { 
        commentId: commentIds,
        status: 'active' 
      }
    });
    
    // 按评论ID分组图片
    const imagesByComment = {};
    commentImages.forEach(image => {
      if (!imagesByComment[image.commentId]) {
        imagesByComment[image.commentId] = [];
      }
      imagesByComment[image.commentId].push(image);
    });
    
    // 获取所有用户信息
    const userIds = [...new Set(comments.map(comment => comment.authorId))];
    const users = await User.findAll({
      where: { id: userIds },
      attributes: ['id', 'username', 'avatar']
    });
    
    // 创建用户映射
    const userMap = {};
    users.forEach(user => {
      userMap[user.id] = user;
    });
    
    // 格式化返回数据
    const formattedComments = comments.map(comment => ({
      id: comment.id,
      content: comment.content,
      image: comment.image,
      CommentImages: imagesByComment[comment.id] || [],
      User: userMap[comment.authorId] || { id: comment.authorId, username: '未知用户' },
      created_at: comment.created_at,
      targetId: comment.targetId
    }));
    
    res.json(formattedComments);
  } catch (err) {
    console.error('获取评论失败:', err);
    res.status(500).json({ error: '获取评论失败', details: err.message });
  }
});

// 创建评论（支持图片上传）
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
    try {
    console.log('创建评论请求:', req.body);
    console.log('上传的文件:', req.file);
    
    const { content, targetId } = req.body;
    const userId = req.user.id;
    
    // 构建评论数据
    const commentData = {
      content,
      targetId: targetId || 'default',
      authorId: userId,
      status: 'active'
    };
    
        // 如果有上传的图片
        if (req.file) {
          console.log('图片信息:', {
            filename: req.file.filename,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
          });
          // 使用相对路径，前端通过相对路径访问
          commentData.image = `/uploads/${req.file.filename}`;
        }
    
    const comment = await Comment.create(commentData);
    console.log('评论创建成功:', comment.id);
    
        // 如果需要单独存储图片到commentimages表
    if (req.file) {
      await CommentImage.create({
        commentId: comment.id,
        imageUrl: `/uploads/${req.file.filename}`,
        filename: req.file.originalname,
        mime_type: req.file.mimetype,
        file_size: req.file.size,
        status: 'active'
      });
      console.log('评论图片创建成功');
    }
    
        // 直接返回创建的评论，不立即查询关联
    // 前端可以通过重新获取所有评论来获取完整的用户信息
    res.status(201).json({
      id: comment.id,
      content: comment.content,
      image: comment.image,
      created_at: comment.created_at,
      authorId: userId
    });
    } catch (err) {
    console.error('创建评论失败 - 详细错误:', err);
    console.error('错误堆栈:', err.stack);
    res.status(500).json({ error: '创建评论失败', details: err.message });
  }
});

// 获取特定目标的评论
router.get('/:targetId', async (req, res) => {
  try {
    // 获取特定目标的评论
    const comments = await Comment.findAll({
      where: { 
        targetId: req.params.targetId,
        status: 'active' 
      },
      order: [['created_at', 'DESC']]
    });
    
    // 获取所有评论图片
    const commentIds = comments.map(comment => comment.id);
    const commentImages = await CommentImage.findAll({
      where: { 
        commentId: commentIds,
        status: 'active' 
      }
    });
    
    // 按评论ID分组图片
    const imagesByComment = {};
    commentImages.forEach(image => {
      if (!imagesByComment[image.commentId]) {
        imagesByComment[image.commentId] = [];
      }
      imagesByComment[image.commentId].push(image);
    });
    
    // 获取所有用户信息
    const userIds = [...new Set(comments.map(comment => comment.authorId))];
    const users = await User.findAll({
      where: { id: userIds },
      attributes: ['id', 'username', 'avatar']
    });
    
    // 创建用户映射
    const userMap = {};
    users.forEach(user => {
      userMap[user.id] = user;
    });
    
    // 格式化返回数据
    const formattedComments = comments.map(comment => ({
      id: comment.id,
      content: comment.content,
      image: comment.image,
      CommentImages: imagesByComment[comment.id] || [],
      User: userMap[comment.authorId] || { id: comment.authorId, username: '未知用户' },
      created_at: comment.created_at,
      targetId: comment.targetId
    }));
    
    res.json(formattedComments);
  } catch (err) {
    console.error('获取评论失败:', err);
    res.status(500).json({ error: '获取评论失败', details: err.message });
  }
});

// 删除评论（软删除）
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    console.log('删除评论请求:', {
      commentId: req.params.id,
      userId: req.user.id,
      user: req.user
    });
    
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) {
      console.log('评论不存在:', req.params.id);
      return res.status(404).json({ error: '评论不存在' });
    }
    
    console.log('找到评论:', {
      id: comment.id,
      authorId: comment.authorId,
      content: comment.content
    });
    
    // 检查权限：只有评论作者可以删除
    if (comment.authorId !== req.user.id) {
      console.log('权限检查失败:', {
        commentAuthorId: comment.authorId,
        currentUserId: req.user.id
      });
      return res.status(403).json({ error: '无权删除此评论' });
    }
    
        console.log('权限检查通过，开始软删除');
    
        try {
          // 方法1：直接使用update方法更新状态
          console.log('更新评论状态为deleted...');
          const updateResult = await Comment.update(
            { status: 'deleted' },
            { 
              where: { id: comment.id }
            }
          );
      
          console.log('评论软删除结果:', { 
            updatedRows: updateResult[0]
          });
      
          if (updateResult[0] === 0) {
            // 如果update失败，尝试直接操作实例
            console.log('update方法失败，尝试直接操作实例...');
            comment.status = 'deleted';
            await comment.save();
            console.log('实例保存成功');
          }
      
          // 同时软删除关联的图片
          console.log('更新关联图片状态为deleted...');
          await CommentImage.update(
            { status: 'deleted' },
            { 
              where: { commentId: comment.id }
            }
          );
      
          console.log('关联图片软删除完成');
      
          // 验证删除结果
          const deletedComment = await Comment.findByPk(comment.id);
          console.log('验证删除结果 - 评论状态:', deletedComment ? deletedComment.status : '评论不存在');
      
          res.json({ 
            message: 'Comment deleted',
            deleted: true,
            commentId: comment.id,
            status: 'deleted',
            method: 'soft_delete'
          });
      
        } catch (error) {
          console.error('删除失败:', error);
          throw error;
        }
  } catch (err) {
    console.error('删除评论失败 - 详细错误:', err);
    console.error('错误堆栈:', err.stack);
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

    await comment.update({ content });

    res.json({
      id: comment.id,
      content: comment.content,
      created_at: comment.created_at,
      updated_at: comment.updated_at
    });
  } catch (err) {
    console.error('编辑评论失败:', err);
    res.status(500).json({ error: '编辑评论失败', details: err.message });
  }
});

// 上传评论图片（单独上传到commentimages表）
router.post('/:commentId/images', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: '评论不存在' });
    }
    
    // 检查权限：只有评论作者可以上传图片
    if (comment.authorId !== req.user.id) {
      return res.status(403).json({ error: '无权为此评论上传图片' });
    }
    
    const image = await CommentImage.create({
      commentId: comment.id,
      imageUrl: `/uploads/${req.file.filename}`,
      filename: req.file.originalname,
      mime_type: req.file.mimetype,
      file_size: req.file.size,
      status: 'active'
    });
    
    res.status(201).json(image);
  } catch (err) {
    console.error('上传图片失败:', err);
    res.status(500).json({ error: '上传图片失败', details: err.message });
  }
});

module.exports = router;
