// File: server/models/Comment.js
// 作用：评论表模型（comments）。支持软删除、targetId 分组、楼中楼回复、视频、审核状态。
//
// 本次新增（相对旧站）：
//   parentId     —— 回复的是哪条评论（楼中楼）；顶层评论为 null
//   rootId       —— 所属的顶层评论 id（顶层自己就等于自己的 id），方便一次取出整棵树
//   videoUrl     —— 评论带的视频（最多 1 个）
//   auditStatus  —— 审核状态：pending 待审 / approved 通过 / rejected 驳回
//                   现在默认 approved（先审后发是开关，见 server/.env 的 COMMENT_AUDIT）
//   reviewNote   —— 审核备注（驳回原因等）
//   reviewedAt / reviewedBy —— 谁在什么时候审的（后续管理员页面用）
//
// 这样后续做「管理员审核页」时，不用再改表结构，直接查 auditStatus 即可。

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// 定义评论模型
const Comment = sequelize.define('Comment', {
  content: {
    type: DataTypes.TEXT,
    // 允许只发图/视频不带文字，所以这里不再是 NOT NULL
    allowNull: true
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
  videoUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'videoUrl'
  },
  // 楼中楼
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'parentId'
  },
  rootId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'rootId'
  },
  status: {
    type: DataTypes.ENUM('active', 'deleted'),
    defaultValue: 'active',
    field: 'status'
  },
  // 审核相关：为后续管理员页面预留
  auditStatus: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'approved',
    field: 'auditStatus'
  },
  reviewNote: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'reviewNote'
  },
  reviewedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'reviewedAt'
  },
  reviewedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'reviewedBy'
  }
}, {
  tableName: 'comments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false
});

module.exports = Comment;
