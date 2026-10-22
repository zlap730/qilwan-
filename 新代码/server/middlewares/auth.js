// File: server/middlewares/auth.js
// 作用：JWT 鉴权中间件。校验 Authorization: Bearer <token>，通过后把用户挂到 req.user。

// Description: JWT验证中间件
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// JWT验证中间件
const authMiddleware = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: '未授权访问' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.userId);
        if (!user) throw new Error();
        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({ error: '无效令牌' });
    }
};

module.exports = authMiddleware;
