import http from './http'

// 与 server/routes/auth.js 一一对应
export function login(payload) {
  return http.post('/auth/login', payload).then((res) => res.data)
}

export function register(payload) {
  return http.post('/auth/register', payload).then((res) => res.data)
}

export function fetchMe() {
  return http.get('/auth/me').then((res) => res.data)
}

/** 忘记密码：向邮箱发送 6 位验证码 */
export function forgotPassword(email) {
  return http.post('/auth/forgot-password', { email }).then((res) => res.data)
}

/** 用验证码重置密码 */
export function resetPassword(payload) {
  return http.post('/auth/reset-password', payload).then((res) => res.data)
}
