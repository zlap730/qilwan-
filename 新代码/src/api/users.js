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
