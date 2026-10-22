// File: server/models/associations.js
// 作用：模型关联。User 1-N Comment，Comment 1-N CommentImage。

const User = require('./User');
const Comment = require('./Comment');
const CommentImage = require('./CommentImage');

// 用户与评论的关联
User.hasMany(Comment, { foreignKey: 'authorId' });
Comment.belongsTo(User, { foreignKey: 'authorId' });

// 评论与图片的关联
Comment.hasMany(CommentImage, { foreignKey: 'commentId' });
CommentImage.belongsTo(Comment, { foreignKey: 'commentId' });
