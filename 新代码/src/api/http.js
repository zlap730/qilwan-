import axios from 'axios'
import { useUserStore } from '@/stores/user'

// 原项目里 API 地址是硬编码的 'http://localhost:3000/api/comments' 这种字符串，
// 一共散落在 4 个 js 文件里，换端口/上线必须全局搜索替换。
// 迁移后只在这里出现一次：开发走 Vite proxy，生产走同域 Nginx。
const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  // 默认 20 秒；发视频的请求在 api/comments.js 里单独放宽到 120 秒
  timeout: 20000
})

http.interceptors.request.use((config) => {
  const store = useUserStore()
  if (store.token) {
    config.headers.Authorization = `Bearer ${store.token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.error || error.response?.data?.message

    // 401 统一登出，替代原来每个页面各自判断 token 是否过期
    if (status === 401) {
      useUserStore().logout()
    }

    // 没有 response 的两种典型情况要分开提示，否则「上传视频超时」会被误报成「后端没启动」
    const isTimeout = error.code === 'ECONNABORTED' || /timeout/i.test(error.message || '')

    error.friendlyMessage =
      message ||
      (status
        ? `请求失败（${status}）`
        : isTimeout
          ? '请求超时：图片/视频较大时需要多等一会儿，也可能是后端没响应'
          : '连不上后端：请确认 Express 服务正在运行（在 新代码 目录执行 npm run server）')

    return Promise.reject(error)
  }
)

export default http
