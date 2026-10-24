// 后台管理接口（对应 server/routes/adminUsers.js、adminComments.js）
// 这些接口全部要求「管理员 token」，普通用户会拿到 403。
import http from './http'

/* ── 用户管理 ─────────────────────────────── */
export function adminUserStats() {
  return http.get('/admin/users/stats').then((res) => res.data)
}

export function adminUserList({ keyword = '', page = 1, pageSize = 10 } = {}) {
  return http.get('/admin/users', { params: { keyword, page, pageSize } }).then((res) => res.data)
}

export function adminSetAdmin(id, isAdmin) {
  return http.patch(`/admin/users/${id}/admin`, { isAdmin }).then((res) => res.data)
}

export function adminResetPassword(id, password) {
  return http.post(`/admin/users/${id}/reset-password`, { password }).then((res) => res.data)
}

export function adminDeleteUser(id) {
  return http.delete(`/admin/users/${id}`).then((res) => res.data)
}

/* ── 评论管理 / 审核 ───────────────────────── */
export { adminStats, adminList, adminReview, adminHide } from './comments'
