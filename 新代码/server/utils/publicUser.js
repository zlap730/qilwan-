// File: server/utils/publicUser.js
// 作用：把 Sequelize 的 User 实例转换成可以安全返回给前端的普通对象。
//
// 为什么需要它：旧代码直接把 user 整个对象塞进 JSON 响应和 Cookie，
// 里面含有 password（bcrypt 哈希）。哈希虽然不能直接反推明文，但泄露出去
// 就可以离线暴力破解，属于必须修掉的问题。这里统一去掉 password。

function toPublicUser(user) {
  if (!user) return null
  const plain = typeof user.toJSON === 'function' ? user.toJSON() : { ...user }
  delete plain.password
  return plain
}

module.exports = { toPublicUser }
