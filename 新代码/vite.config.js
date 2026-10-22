import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 迁移要点 1：开发期用 proxy 把 /api 和 /uploads 转发到原来的 Express（3000），
// 前端代码里就再也不用写 http://localhost:3000 了，生产环境换成 Nginx 同域即可。
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
      '/uploads': { target: 'http://localhost:3000', changeOrigin: true }
    }
  },
  build: {
    // 老项目里的大图直接进 assets，超过 4KB 一律输出成文件，避免 base64 膨胀
    assetsInlineLimit: 4096
  }
})
