// File: server/app.js
// 作用：后端服务入口。负责装配中间件、挂载路由、连接数据库、启动 HTTP 服务。
//
// 与旧代码 app/app.js 的区别（迁移说明）：
//   1. 只保留 /uploads 和 dist/ 两类静态资源；旧版里 ../HTML、../css文档、../JS文件、
//      ../img、../video 这几个静态目录已删除（前端现在由 Vite 打包成 dist/）；
//   2. CORS 白名单从 Live Server 的 5500/5501 改成 Vite 的 5173/4173；
//   3. .env 改成按 __dirname 读取，从任何目录启动都能找到配置文件；
//   4. 先连数据库、再监听端口，避免"端口起来了但库连不上"的假活状态；
//   5. 生产环境（存在 dist/）时顺带把前端也托管了，做到单域名、免 CORS。

const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const fs = require('fs')
const path = require('path')

require('dotenv').config({ path: path.join(__dirname, '.env') })

const app = express()
const distDir = path.join(__dirname, '..', 'dist')

// ────────────────────────────────────────────
// 1. 跨域与安全头
//    开发期前端跑在 Vite(5173)，所以把这两个来源放进来；
//    生产同域部署后这段可以直接删掉。
// ────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173'
]
app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(helmet())

// ────────────────────────────────────────────
// 2. 请求体解析
// ────────────────────────────────────────────
app.use(express.json())
app.use(cookieParser())

// ────────────────────────────────────────────
// 3. 静态资源：用户上传的图片
//    数据库里只存 /uploads/xxx.jpg 这样的相对路径，域名变了也不用改数据
// ────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// ────────────────────────────────────────────
// 4. 业务路由：/api/auth、/api/users、/api/comments
// ────────────────────────────────────────────
app.use('/api', require('./routes'))

// ────────────────────────────────────────────
// 5. 生产环境托管前端（npm run build 产出 dist/ 之后才生效）
//    好处：一个端口、一个域名，不再需要 CORS；history 路由也能正常刷新
// ────────────────────────────────────────────
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir))
  app.get(/^\/(?!api\/|uploads\/).*/, (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'))
  })
}

// ────────────────────────────────────────────
// 6. 兜底 404（走到这里说明不是 /api，也不是存在的静态文件）
// ────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: '资源未找到', path: req.originalUrl })
})

// ────────────────────────────────────────────
// 7. 全局错误处理（multer 的文件类型/大小报错也会走到这里）
// ────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[全局错误]', err.message)
  const status = err.status || (err.code === 'LIMIT_FILE_SIZE' ? 413 : 500)
  res.status(status).json({
    error: status === 500 ? '服务器内部错误' : err.message,
    details: err.message
  })
})

// ────────────────────────────────────────────
// 8. 数据库与启动
// ────────────────────────────────────────────
const sequelize = require('./config/database')
require('./models/associations') // 建立 User / Comment / CommentImage 之间的关联

async function start() {
  try {
    await sequelize.authenticate()
    console.log('数据库连接成功')

    await sequelize.sync()
    console.log('数据库同步成功')

    const PORT = process.env.PORT || 3000
    app.listen(PORT, () => {
      console.log(`后端服务已启动：http://localhost:${PORT}`)
      if (fs.existsSync(distDir)) {
        console.log('检测到 dist/，前端页面与接口同端口提供：http://localhost:' + PORT)
      } else {
        console.log('未检测到 dist/，仅提供 /api 与 /uploads（前端请用 npm run dev）')
      }
    })
  } catch (err) {
    console.error('启动失败：', err.message)
    process.exit(1)
  }
}

start()
