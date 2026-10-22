import http from './http'

// 与 app/routes/auth.js 一一对应
export function login(payload) {
  return http.post('/auth/login', payload).then((res) => res.data)
}

export function register(payload) {
  return http.post('/auth/register', payload).then((res) => res.data)
}

export function fetchMe() {
  return http.get('/auth/me').then((res) => res.data)
}
