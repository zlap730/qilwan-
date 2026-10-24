// File: server/scripts/cleanup-uploads.js
// 作用：清理 uploads 里「数据库已经不引用」的孤儿文件。
//
// ⚠️ 默认是「只看不删」的预演模式，确认没问题后再加 --yes 才会真的删除。
//    之前有一次直接删，把一批旧站遗留的图片也删掉了（数据库没引用，但可能是手写页面在用的），
//    所以这里强制两步走。
//
// 用法（在 新代码/ 目录下）：
//   node server/scripts/cleanup-uploads.js            → 只列出会删哪些
//   node server/scripts/cleanup-uploads.js --yes      → 真的删除

const fs = require('fs')
const path = require('path')
const { User, Comment, CommentImage } = require(path.join(__dirname, '..', 'models'))
const sequelize = require(path.join(__dirname, '..', 'config', 'database'))

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads')
const KEEP_ALWAYS = new Set(['default_avatar.png'])

async function collectReferenced() {
  const referenced = new Set(KEEP_ALWAYS)

  for (const row of await User.findAll({ attributes: ['avatar'], raw: true })) {
    if (row.avatar) referenced.add(row.avatar.split('/').pop())
  }
  for (const row of await Comment.findAll({ attributes: ['image', 'videoUrl'], raw: true })) {
    if (row.image) referenced.add(row.image.split('/').pop())
    if (row.videoUrl) referenced.add(row.videoUrl.split('/').pop())
  }
  for (const row of await CommentImage.findAll({ attributes: ['imageUrl'], raw: true })) {
    if (row.imageUrl) referenced.add(row.imageUrl.split('/').pop())
  }

  return referenced
}

async function main() {
  const apply = process.argv.includes('--yes')
  const referenced = await collectReferenced()

  const files = fs
    .readdirSync(UPLOAD_DIR)
    .filter((name) => fs.statSync(path.join(UPLOAD_DIR, name)).isFile())
  const orphans = files.filter((name) => !referenced.has(name))

  console.log(`uploads 共 ${files.length} 个文件，被引用 ${files.length - orphans.length} 个，无人引用 ${orphans.length} 个`)
  for (const name of orphans) console.log(`  ${apply ? '删除' : '将删除'}: ${name}`)

  if (!orphans.length) {
    console.log('没有需要清理的文件。')
  } else if (!apply) {
    console.log('\n这是预演（没有删除任何文件）。确认无误后加 --yes 再执行一次：')
    console.log('  node server/scripts/cleanup-uploads.js --yes')
  } else {
    for (const name of orphans) fs.unlinkSync(path.join(UPLOAD_DIR, name))
    console.log(`\n已删除 ${orphans.length} 个文件。`)
  }

  await sequelize.close()
}

main().catch((err) => {
  console.error('清理失败：', err.message)
  process.exit(1)
})
