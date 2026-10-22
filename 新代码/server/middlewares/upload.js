// File: server/middlewares/upload.js
// 作用：multer 上传中间件。只收 JPEG/PNG、单文件最大 20MB、文件名用时间戳避免重名。
// 迁移改动：destination 从相对路径 'uploads/' 改成用 __dirname 拼出的绝对路径。
//          旧写法取决于"从哪个目录启动服务"，从项目根启动就会把文件存到 新代码/uploads，
//          而静态路由读的却是 server/uploads，结果图片传上去却打不开。

const multer = require('multer')
const fs = require('fs')
const path = require('path')

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads')
fs.mkdirSync(UPLOAD_DIR, { recursive: true }) // 目录不存在时自动创建

// 存储策略：文件名 = 时间戳 + 原扩展名
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname).toLowerCase()}`)
  }
})

// 文件类型过滤
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png']
  allowedTypes.includes(file.mimetype) ? cb(null, true) : cb(new Error('仅支持JPEG/PNG格式'))
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB
})

module.exports = upload
