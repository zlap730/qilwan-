// File: server/config/database.js
// 作用：数据库连接配置。用 Sequelize 连 MySQL，连接参数全部来自 server/.env。

// # 数据库配置文件
// # 该文件用于配置数据库连接信息
// # 使用 Sequelize 作为 ORM 框架
// # 需要安装 dotenv 来加载环境变量
const path = require('path');
const { Sequelize } = require('sequelize');

// 显式加载项目根目录 .env，避免从 app/ 目录启动时路径错误
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); // 加载根目录下的 .env 文件
//.env 文件示例内容：
// DB_NAME=your_database
// DB_USER=root
// DB_PASSWORD=your_password
// DB_HOST=localhost
// 初始化 Sequelize 实例：MySQL
const sequelize = new Sequelize(
  process.env.DB_NAME || 'your_database',  // 数据库名称
  process.env.DB_USER || 'root',   // 数据库用户名
  process.env.DB_PASSWORD || '', // 数据库密码
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql', // 使用 MySQL 数据库
    logging: false,  // 关闭 SQL 查询日志输出
    pool: {   
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = sequelize;
