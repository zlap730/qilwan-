// File: server/routes/index.js
// 作用：路由总装配。把 /api/auth、/api/users、/api/comments 三组路由拼到 /api 下面。

const express = require('express');
const authRoutes = require('./auth');
const userRoutes = require('./userRoutes');
const commentRoutes = require('./comments');

const router = express.Router();

// 注意：这些路由已经在 app.js 中通过 app.use('/api', require('./routes')) 添加了 /api 前缀
// 所以这里不需要再添加 /api 前缀

// 认证路由：最终路径为 /api/auth
router.use('/auth', authRoutes);

// 用户路由：最终路径为 /api/users
router.use('/users', userRoutes);

// 评论路由：最终路径为 /api/comments
router.use('/comments', commentRoutes);

module.exports = router;
