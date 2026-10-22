// File: server/models/CommentImage.js
// 作用：评论图片表模型（commentimages）。一条评论可以挂多张图。

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// 定义评论图片模型
const CommentImage = sequelize.define('CommentImage', {
  commentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'commentId'
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'imageUrl'
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '',
    field: 'filename'
  },
  mimeType: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'image/jpeg',
    field: 'mime_type'
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'file_size'
  },
  status: {
    type: DataTypes.ENUM('active', 'deleted'),
    defaultValue: 'active',
    field: 'status'
  }
}, {
  tableName: 'commentimages',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false
});

module.exports = CommentImage;
