// File: server/utils/migrate.js
// 作用：轻量级「补列」迁移。在 sequelize.sync() 之后调用。
//
// 为什么需要：sequelize.sync() 只会**新建**缺失的表，不会给已经存在的表加新列。
// 本次讨论区升级给 comments / commentimages / users 加了几列，
// 老数据库里没有这些列，直接查会报 "Unknown column 'videoUrl' in 'field list'"。
//
// 做法：查 information_schema，缺哪列补哪列（幂等，重复执行安全）。
// 注意：这里只做「加列 / 加索引」，不做删改，避免误伤数据。

const sequelize = require('../config/database')

const DB_NAME = () => process.env.DB_NAME || 'zp_database'

async function hasColumn(table, column) {
  const [rows] = await sequelize.query(
    `SELECT COUNT(*) AS n FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    { replacements: [DB_NAME(), table, column] }
  )
  return Number(rows[0].n) > 0
}

async function hasIndex(table, indexName) {
  const [rows] = await sequelize.query(
    `SELECT COUNT(*) AS n FROM information_schema.STATISTICS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME = ?`,
    { replacements: [DB_NAME(), table, indexName] }
  )
  return Number(rows[0].n) > 0
}

async function addColumn(table, column, definition) {
  if (await hasColumn(table, column)) return false
  await sequelize.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`)
  console.log(`[migrate] ${table}.${column} 已添加`)
  return true
}

async function addIndex(table, indexName, columns) {
  if (await hasIndex(table, indexName)) return false
  await sequelize.query(`ALTER TABLE \`${table}\` ADD INDEX \`${indexName}\` (${columns})`)
  console.log(`[migrate] ${table} 索引 ${indexName} 已添加`)
  return true
}

/**
 * 执行所有补丁。返回本次实际做了多少项改动（0 表示库已经是最新）。
 */
async function runMigrations() {
  let changed = 0

  // ── comments：楼中楼 + 视频 + 审核 ──
  const commentColumns = [
    ['content', 'TEXT NULL'],
    ['videoUrl', 'VARCHAR(255) NULL'],
    ['parentId', 'INT NULL'],
    ['rootId', 'INT NULL'],
    ['auditStatus', "ENUM('pending','approved','rejected') NOT NULL DEFAULT 'approved'"],
    ['reviewNote', 'VARCHAR(255) NULL'],
    ['reviewedAt', 'DATETIME NULL'],
    ['reviewedBy', 'INT NULL']
  ]
  for (const [column, definition] of commentColumns) {
    if (await addColumn('comments', column, definition)) changed += 1
  }

  // 楼中楼查询会按 rootId / parentId 过滤，加索引
  if (await addIndex('comments', 'idx_comments_root', '`rootId`')) changed += 1
  if (await addIndex('comments', 'idx_comments_audit', '`auditStatus`')) changed += 1

  // ── commentimages：区分图片 / 视频 ──
  if (await addColumn('commentimages', 'mediaType', "ENUM('image','video') NOT NULL DEFAULT 'image'")) changed += 1

  // ── users：管理员标记 ──
  if (await addColumn('users', 'isAdmin', 'TINYINT(1) NOT NULL DEFAULT 0')) changed += 1

  return changed
}

module.exports = { runMigrations }
