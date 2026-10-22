import http from './http'

// 与 app/routes/comments.js 一一对应
export function listComments(targetId) {
  const url = targetId ? `/comments/${encodeURIComponent(targetId)}` : '/comments'
  return http.get(url).then((res) => res.data)
}

export function createComment({ content, targetId, image }) {
  const form = new FormData()
  form.append('content', content ?? '')
  if (targetId) form.append('targetId', targetId)
  if (image) form.append('image', image)

  // 注意：给 FormData 手动设置 Content-Type 会丢掉 boundary，交给 axios 自动生成
  return http.post('/comments', form).then((res) => res.data)
}

export function deleteComment(id) {
  return http.delete(`/comments/${id}`).then((res) => res.data)
}
