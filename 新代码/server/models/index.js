// File: server/models/index.js
// 作用：模型统一出口。其它文件只要 `require("../models")` 就能拿到 User / Comment / CommentImage。

const User = require('./User');
const Comment = require('./Comment');
const CommentImage = require('./CommentImage');

// 导出所有模型
module.exports = {
    User,
    Comment,
    CommentImage
};
