// File: server/models/User.js
// 作用：用户表模型（users）。字段：用户名、邮箱、密码哈希、头像、简介。

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// 用户模型
const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    avatar: {
        type: DataTypes.STRING, // 用户头像 URL
        allowNull: true
    },
    bio: {
        type: DataTypes.TEXT, // 用户简介
        allowNull: true
    },
    // 管理员标记：后续「评论审核」页面用它判断能不能进来
    // 现在没有任何人默认是管理员，需要用 npm run make-admin 脚本或在数据库里手动置 true
    isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'isAdmin'
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = User;
