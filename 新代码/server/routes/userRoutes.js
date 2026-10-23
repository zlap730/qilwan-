// File: server/routes/userRoutes.js
// 作用：用户资料接口。查资料、改资料（可传头像）、改密码、我的评论、删账号。
// 挂载位置：/api/users
// 迁移改动：① GET /me 挪到 GET /:id 前面 —— 否则 "me" 会被当成 id 去查；
//          ② 更新/删除加了"只能操作自己的账号"的校验（旧版任何人登录后都能改别人）；
//          ③ 新增 PUT /me/password（改密码要验旧密码）和 GET /me/comments（个人中心的评论管理）。

const express = require('express')
const userController = require('../controllers/userController')
const authMiddleware = require('../middlewares/auth')
const upload = require('../middlewares/upload')

const router = express.Router()

// ── 写在 /:id 之前的「当前用户」路由 ──────────────────────────
// 当前登录用户
router.get('/me', authMiddleware, userController.getMe)

// 修改密码：必须提供旧密码，防止 token 被盗后直接改密码
router.put('/me/password', authMiddleware, userController.changePassword)

// 我发过的评论（个人中心 → 评论管理）
router.get('/me/comments', authMiddleware, userController.getMyComments)

// ── 按 id 操作 ─────────────────────────────────────────────
// 按 id 查用户
router.get('/:id', authMiddleware, userController.getUser)

// 更新资料（multipart/form-data，字段名 avatar）
router.put('/:id', authMiddleware, upload.single('avatar'), userController.updateUser)

// 删除账号
router.delete('/:id', authMiddleware, userController.deleteUser)

module.exports = router
