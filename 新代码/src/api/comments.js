// 讨论区接口（对应 server/routes/comments.js）
import http from './http'

// 与 server/routes/comments.js 一一对应
export function listComments(targetId) {
  const url = targetId ? `/comments/${encodeURIComponent(targetId)}` : '/comments'
  return http.get(url).then((res) => res.data)
}

/**
 * 发评论 / 回复（multipart）
 * @param {object} payload
 * @param {string} payload.content  正文（可以只发图，此时可为空）
 * @param {string} [payload.targetId]
 * @param {number|string} [payload.parentId] 回复哪条评论（楼中楼）
 * @param {File[]} [payload.images] 最多 9 张
 * @param {File} [payload.video]    最多 1 个
 */
export function createComment({ content, targetId, parentId, images = [], video } = {}) {
  const form = new FormData()
  form.append('content', content ?? '')
  if (targetId) form.append('targetId', targetId)
  if (parentId) form.append('parentId', parentId)
  images.forEach((file) => form.append('images', file))
  if (video) form.append('video', video)

  // 注意：给 FormData 手动设置 Content-Type 会丢掉 boundary，交给 axios 自动生成
  return http.post('/comments', form).then((res) => res.data)
}

export function deleteComment(id) {
  return http.delete(`/comments/${id}`).then((res) => res.data)
}

/** 编辑自己的评论正文（个人中心 → 评论管理） */
export function updateComment(id, content) {
  return http.patch(`/comments/${id}`, { content }).then((res) => res.data)
}

/* ── 管理员接口（后续管理页面用，现在先留好）─────────────── */
export function adminStats() {
  return http.get('/admin/comments/stats').then((res) => res.data)
}

export function adminList({ status = 'pending', page = 1, keyword = '' } = {}) {
  return http
    .get('/admin/comments', { params: { status, page, keyword } })
    .then((res) => res.data)
}

export function adminReview(id, auditStatus, reviewNote = '') {
  return http.patch(`/admin/comments/${id}/review`, { auditStatus, reviewNote }).then((res) => res.data)
}

export function adminHide(id) {
  return http.post(`/admin/comments/${id}/hide`).then((res) => res.data)
}
