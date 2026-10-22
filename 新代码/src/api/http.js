import axios from 'axios'
import { useUserStore } from '@/stores/user'

// 原项目里 API 地址是硬编码的 'http://localhost:3000/api/comments' 这种字符串，
// 一共散落在 4 个 js 文件里，换端口/上线必须全局搜索替换。
// 迁移后只在这里出现一次：开发走 Vite proxy，生产走同域 Nginx。
const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  timeout: 15000
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

    error.friendlyMessage =
      message || (status ? `请求失败（${status}）` : '网络异常：请确认 app/ 里的 Express 服务已启动')
    return Promise.reject(error)
  }
)

export default http
