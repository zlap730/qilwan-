// File: server/scripts/create-admin.js
// 作用：创建（或修复）管理员账号。已经存在同名用户时只升级为管理员 + 重置密码。
//
// 用法（在 新代码/ 目录下）：
//   node server/scripts/create-admin.js admin 946898zhoupeng
//   npm run create-admin -- admin 946898zhoupeng
//
// 注意：密码会以 bcrypt 哈希入库，脚本本身不保存明文。

const path = require('path')
const bcrypt = require('bcrypt')
const { User } = require(path.join(__dirname, '..', 'models'))
const sequelize = require(path.join(__dirname, '..', 'config', 'database'))

async function main() {
  const [username, password] = process.argv.slice(2)

  if (!username || !password) {
    console.error('用法：node server/scripts/create-admin.js <用户名> <密码>')
    process.exitCode = 1
    await sequelize.close()
    return
  }
  if (password.length < 6) {
    console.error('密码至少 6 位')
    process.exitCode = 1
    await sequelize.close()
    return
  }

  const existing = await User.findOne({ where: { username } })
  const hashed = await bcrypt.hash(password, 10)

  if (existing) {
    await existing.update({ password: hashed, isAdmin: true })
    console.log(`已更新管理员：${username}（id=${existing.id}），密码已重置`)
  } else {
    const created = await User.create({
      username,
      password: hashed,
      email: `${username}@qile.local`,
      avatar: '/uploads/default_avatar.png',
      bio: '站点管理员',
      isAdmin: true
    })
    console.log(`已创建管理员：${username}（id=${created.id}）`)
  }

  console.log('现在可以用这个账号登录，然后访问 /admin')
  await sequelize.close()
}

main().catch((err) => {
  console.error('执行失败：', err.message)
  process.exit(1)
})
