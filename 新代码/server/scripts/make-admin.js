// File: server/scripts/make-admin.js
// 作用：把某个用户设成管理员（或取消）。后续「评论审核」页面需要 isAdmin。
//
// 用法（在 新代码/ 目录下）：
//   node server/scripts/make-admin.js 用户名          → 设为管理员
//   node server/scripts/make-admin.js 用户名 --revoke → 取消管理员
//   node server/scripts/make-admin.js --list          → 列出所有管理员

const path = require('path')
const { User } = require(path.join(__dirname, '..', 'models'))
const sequelize = require(path.join(__dirname, '..', 'config', 'database'))

async function main() {
  const args = process.argv.slice(2)

  if (args.includes('--list') || args.length === 0) {
    const admins = await User.findAll({ where: { isAdmin: true }, attributes: ['id', 'username'] })
    console.log(admins.length ? '当前管理员：' : '当前还没有管理员。')
    admins.forEach((u) => console.log(`  #${u.id} ${u.username}`))
    console.log('\n用法：node server/scripts/make-admin.js 用户名 [--revoke]')
    await sequelize.close()
    return
  }

  const username = args[0]
  const revoke = args.includes('--revoke')

  const user = await User.findOne({ where: { username } })
  if (!user) {
    console.error(`找不到用户：${username}`)
    process.exitCode = 1
    await sequelize.close()
    return
  }

  await user.update({ isAdmin: !revoke })
  console.log(`${revoke ? '已取消管理员' : '已设为管理员'}：${user.username}（id=${user.id}）`)
  console.log('提示：让对方重新登录（或刷新 /api/auth/me），前端的 isAdmin 才会更新。')
  await sequelize.close()
}

main().catch((err) => {
  console.error('执行失败：', err.message)
  process.exit(1)
})
