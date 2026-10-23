// 用户资料相关接口（对应 server/routes/userRoutes.js）
// 注意：更新资料要传 FormData（头像走 multipart），不要手动设置 Content-Type
import http from './http'

export function fetchMe() {
  return http.get('/users/me').then((res) => res.data)
}

export function fetchUser(id) {
  return http.get(`/users/${id}`).then((res) => res.data)
}

export function updateUser(id, formData) {
  return http.put(`/users/${id}`, formData).then((res) => res.data)
}

export function deleteUser(id) {
  return http.delete(`/users/${id}`).then((res) => res.data)
}

/** 修改密码：必须带旧密码（后端会校验） */
export function changePassword(payload) {
  return http.put('/users/me/password', payload).then((res) => res.data)
}

/** 我发过的评论；status 可传 'active' | 'deleted'，不传为全部 */
export function fetchMyComments(status) {
  const query = status ? `?status=${status}` : ''
  return http.get(`/users/me/comments${query}`).then((res) => res.data)
}
