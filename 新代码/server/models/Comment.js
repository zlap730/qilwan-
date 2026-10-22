// File: server/models/Comment.js
// 作用：评论表模型（comments）。支持软删除（status: active / deleted）和 targetId 分组。

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// 定义评论模型
const Comment = sequelize.define('Comment', {
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  authorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'authorId'  // 明确指定字段名
  },
  targetId: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'targetId'
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'deleted'),
    defaultValue: 'active',
    field: 'status'
  }
}, {
  tableName: 'comments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false
});

module.exports = Comment;
