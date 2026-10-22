// File: server/controllers/userController.js
// 作用：用户资料的业务逻辑（查 / 改 / 删），由 routes/userRoutes.js 调用。
// 迁移改动：① 新增 getMe；② 更新、删除前校验"是不是本人"；
//          ③ 头像统一存 /uploads/xxx 相对路径；④ 返回体统一去掉 password；
//          ⑤ 删除账号时先删掉该用户的评论/评论图片，否则数据库外键会拦下来（旧代码这里必定 500）。

const { User, Comment, CommentImage } = require('../models')
const sequelize = require('../config/database')
const bcrypt = require('bcrypt')
const fs = require('fs')
const path = require('path')
const { toPublicUser } = require('../utils/publicUser')

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads')

// 从各种历史格式里取出文件名，兼容三种老数据：
//   http://localhost:3000/uploads/a.jpg 、 ../app/uploads/a.jpg 、 /uploads/a.jpg
function pickFilename(avatar) {
  if (!avatar) return null
  const name = avatar.split('/').pop()
  return name && name !== 'default_avatar.png' ? name : null
}

// 换头像 / 删账号时清理旧文件，避免 uploads 越堆越多
function removeOldAvatar(avatar) {
  const filename = pickFilename(avatar)
  if (!filename) return
  const filePath = path.join(UPLOAD_DIR, filename)
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
    console.log('已删除旧头像文件:', filePath)
  }
}

// 只能操作自己的账号
function isSelf(req) {
  return Number(req.params.id) === Number(req.user.id)
}

// 取当前登录用户
exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id)
    if (!user) return res.status(404).json({ error: '用户不存在' })
    res.json(toPublicUser(user))
  } catch (err) {
    res.status(500).json({ error: '服务器错误', details: err.message })
  }
}

// 按 id 取用户
exports.getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id)
    if (!user) return res.status(404).json({ error: '用户不存在' })
    res.json(toPublicUser(user))
  } catch (err) {
    res.status(500).json({ error: '服务器错误', details: err.message })
  }
}

// 更新资料
exports.updateUser = async (req, res) => {
  try {
    if (!isSelf(req)) return res.status(403).json({ error: '只能修改自己的资料' })

    const user = await User.findByPk(req.params.id)
    if (!user) return res.status(404).json({ error: '用户不存在' })

    const { username, email, password, bio } = req.body

    // 只更新前端真正传上来的字段，避免用 undefined 把原值覆盖成 null
    const updatedData = {}
    if (username !== undefined) updatedData.username = username
    if (email !== undefined) updatedData.email = email
    if (bio !== undefined) updatedData.bio = bio
    if (password) updatedData.password = await bcrypt.hash(password, 10)

    if (req.file) {
      updatedData.avatar = `/uploads/${req.file.filename}`
      removeOldAvatar(user.avatar)
    }

    await user.update(updatedData)
    res.json(toPublicUser(user))
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: '用户名或邮箱已被占用' })
    }
    res.status(500).json({ error: '更新用户信息失败', details: err.message })
  }
}

// 删除账号
// 注意：comments/comments_image 表对 users 有外键，直接删 user 会报 FK 约束错误（旧代码的 500 就是这么来的）。
// 这里用事务按「评论图片 → 评论 → 用户」的顺序清理，保证要么全删、要么全不删。
exports.deleteUser = async (req, res) => {
  try {
    if (!isSelf(req)) return res.status(403).json({ error: '只能删除自己的账号' })

    const user = await User.findByPk(req.params.id)
    if (!user) return res.status(404).json({ error: '用户不存在' })

    await sequelize.transaction(async (transaction) => {
      const comments = await Comment.findAll({ where: { authorId: user.id }, transaction })
      const commentIds = comments.map((item) => item.id)

      if (commentIds.length > 0) {
        await CommentImage.destroy({ where: { commentId: commentIds }, transaction })
        await Comment.destroy({ where: { authorId: user.id }, transaction })
      }

      removeOldAvatar(user.avatar)
      await user.destroy({ transaction })
    })

    res.status(200).json({ message: '账号已成功删除（含该账号的评论）' })
  } catch (err) {
    res.status(500).json({ error: '删除账号失败', details: err.message })
  }
}
