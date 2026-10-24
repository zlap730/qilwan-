// File: server/middlewares/admin.js
// 作用：管理员校验。必须在 authMiddleware 之后使用（依赖 req.user）。
//
// 现在管理员靠 users.isAdmin 标记；想指定谁，可以在数据库里改：
//   UPDATE users SET isAdmin = 1 WHERE username = '你的账号';
// 后续做管理页面时，前端只需要判断 /api/auth/me 返回里的 isAdmin。

const adminMiddleware = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: '未登录' });
  if (!req.user.isAdmin) return res.status(403).json({ error: '需要管理员权限' });
  next();
};

module.exports = adminMiddleware;
