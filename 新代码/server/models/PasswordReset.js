// File: server/models/PasswordReset.js
// 作用：找回密码用的验证码表（password_resets）。
//
// 为什么单独建表而不是在 users 上加两列：
//   ① 一次找回要留痕（谁、什么时候、用没用过），方便排查；
//   ② 用户可以连续点几次「发送验证码」，旧的应当作废、新的生效，多行更好处理；
//   ③ 不污染 users 表的字段。
//
// 安全约定：
//   · 数据库里只存验证码的哈希（bcrypt），明文只出现在邮件里；
//   · 有效期 10 分钟，用过即标记 usedAt；
//   · 同一账号 60 秒内只能发一次，验证码最多试 5 次。

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PasswordReset = sequelize.define('PasswordReset', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id'
  },
  codeHash: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'code_hash'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expires_at'
  },
  usedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'used_at'
  },
  attempts: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'password_resets',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  underscored: false
});

module.exports = PasswordReset;
