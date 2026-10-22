import placeholder from '@/assets/img/图标文件/占位.png'

/**
 * 统一处理后端返回的资源地址。
 *
 * 原项目里在评论区重复写了 3 遍这种代码：
 *   avatar = avatar.replace('http://localhost:3000', '')
 *   avatar = avatar.replace('/uploads/', '../app/uploads/')
 * 之所以要手工改成 ../app/uploads/，是因为当时前端跑在 Live Server(5500)、
 * 后端跑在 3000，靠相对路径「碰运气」能找到图片。
 *
 * 迁移后：/uploads/xxx 交给 Vite proxy（开发）或 Nginx（生产）转发，
 * 前端只需要一个函数，不会再出现 ../app/uploads/ 这种路径耦合。
 */
export function resolveAssetUrl(raw, fallback = placeholder) {
  if (!raw) return fallback
  if (raw.startsWith('data:') || raw.startsWith('blob:')) return raw

  // 兼容三种历史写法（老数据库里都可能有）：
  //   http://localhost:3000/uploads/a.jpg  → /uploads/a.jpg
  //   ../app/uploads/a.jpg                 → /uploads/a.jpg
  //   /uploads/a.jpg                       → 原样返回
  const uploadsIndex = raw.indexOf('/uploads/')
  if (uploadsIndex >= 0) return raw.slice(uploadsIndex)

  if (/^(https?:)?\/\//i.test(raw)) return raw
  return raw
}

export function resolveAvatar(user) {
  return resolveAssetUrl(user?.avatar)
}

export function formatTime(value) {
  if (!value) return '刚刚'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '刚刚'
  return date.toLocaleString('zh-CN', { hour12: false })
}
