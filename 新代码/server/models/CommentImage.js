// File: server/models/CommentImage.js
// 作用：评论媒体表模型（commentimages）。一条评论可以挂多张图（最多 9 张）+ 1 个视频。
//
// 本次新增 mediaType：区分图片和视频，前端据此决定用 <img> 还是 <video> 渲染。
// 复用同一张表的好处：图片和视频的「排序、删除、审核」逻辑完全一样。

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
  // image | video
  mediaType: {
    type: DataTypes.ENUM('image', 'video'),
    defaultValue: 'image',
    field: 'mediaType'
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
