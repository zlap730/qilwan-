// File: server/models/associations.js
// 作用：模型关联。User 1-N Comment，Comment 1-N CommentImage，User 1-N PasswordReset。

const User = require('./User');
const Comment = require('./Comment');
const CommentImage = require('./CommentImage');
const PasswordReset = require('./PasswordReset');

// 用户与评论的关联
User.hasMany(Comment, { foreignKey: 'authorId' });
Comment.belongsTo(User, { foreignKey: 'authorId' });

// 评论与图片的关联
Comment.hasMany(CommentImage, { foreignKey: 'commentId' });
CommentImage.belongsTo(Comment, { foreignKey: 'commentId' });

// 用户与找回密码验证码的关联（删用户时一并清理）
User.hasMany(PasswordReset, { foreignKey: 'userId', onDelete: 'CASCADE' });
PasswordReset.belongsTo(User, { foreignKey: 'userId' });
