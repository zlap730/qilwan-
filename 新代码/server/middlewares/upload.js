// File: server/middlewares/upload.js
// 作用：multer 上传中间件。
//
// 两种上传：
//   upload   —— 单图（头像、旧接口的单张评论图），JPEG/PNG，最大 20MB
//   media    —— 评论媒体：最多 9 张图 + 1 个视频
//               图片：JPEG/PNG/WEBP/GIF，单张 ≤ 20MB
//               视频：MP4/WEBM/MOV，单个 ≤ 50MB（约 1 分钟手机视频的量级）
//
// 迁移改动：destination 从相对路径 'uploads/' 改成用 __dirname 拼出的绝对路径。
//          旧写法取决于"从哪个目录启动服务"，从项目根启动就会把文件存到 新代码/uploads，
//          而静态路由读的却是 server/uploads，结果图片传上去却打不开。

const multer = require('multer')
const fs = require('fs')
const path = require('path')

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads')
fs.mkdirSync(UPLOAD_DIR, { recursive: true }) // 目录不存在时自动创建

// 视频上限：50MB。再大就要考虑对象存储/断点续传，超出了本项目的定位
const MAX_VIDEO_MB = 50
const MAX_IMAGE_MB = 20

// 存储策略：文件名 = 时间戳 + 4 位随机 + 原扩展名，避免同毫秒多文件重名
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const random = Math.random().toString(36).slice(2, 6)
    cb(null, `${Date.now()}-${random}${path.extname(file.originalname).toLowerCase()}`)
  }
})

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']

// 头像/单图：沿用旧规则，只收 JPEG/PNG
const singleFilter = (req, file, cb) => {
  if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
    return cb(new Error('仅支持JPEG/PNG格式'))
  }
  cb(null, true)
}

const upload = multer({
  storage,
  fileFilter: singleFilter,
  limits: { fileSize: MAX_IMAGE_MB * 1024 * 1024 }
})

// 评论媒体：图片 + 视频混合。字段名约定：
//   images（最多 9 个）
//   video （最多 1 个）
const mediaFilter = (req, file, cb) => {
  if (IMAGE_TYPES.includes(file.mimetype) || VIDEO_TYPES.includes(file.mimetype)) {
    return cb(null, true)
  }
  cb(new Error('评论只支持 JPG/PNG/WEBP/GIF 图片，或 MP4/WEBM/MOV 视频'))
}

const media = multer({
  storage,
  fileFilter: mediaFilter,
  limits: {
    // 单文件上限取两者较大值，具体到每个文件再按类型判断
    fileSize: MAX_VIDEO_MB * 1024 * 1024,
    files: 10 // 9 图 + 1 视频
  }
})

// 在路由里做「按类型判断大小」：multer 的 limits 只能给一个全局值
function checkMediaSizes(req, res, next) {
  const files = req.files || {}
  const images = files.images || []
  const videos = files.video || []

  if (images.length > 9) {
    return res.status(400).json({ error: '图片最多 9 张' })
  }
  if (videos.length > 1) {
    return res.status(400).json({ error: '视频最多 1 个' })
  }

  for (const file of images) {
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      return res.status(400).json({ error: `单张图片不能超过 ${MAX_IMAGE_MB}MB` })
    }
  }
  for (const file of videos) {
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
      return res.status(400).json({ error: `视频不能超过 ${MAX_VIDEO_MB}MB` })
    }
  }

  next()
}

upload.MAX_VIDEO_MB = MAX_VIDEO_MB
upload.MAX_IMAGE_MB = MAX_IMAGE_MB
upload.media = media
upload.checkMediaSizes = checkMediaSizes
upload.UPLOAD_DIR = UPLOAD_DIR

module.exports = upload
