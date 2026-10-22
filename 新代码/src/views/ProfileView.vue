<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { deleteUser, fetchMe, updateUser } from '@/api/users'
import { useUserStore } from '@/stores/user'
import { resolveAvatar } from '@/utils/asset'

/*
 * 个人信息页：原 HTML/个人信息.html + JS文件/个人信息.js
 * 原实现：从 document.cookie 读用户、手动拼 document.getElementById、PUT ../app/uploads 路径。
 * 迁移后：登录态来自 Pinia，数据来自 GET /api/users/me，保存走 PUT /api/users/:id（multipart）。
 */

const router = useRouter()
const store = useUserStore()

const form = reactive({
  username: '',
  email: '',
  bio: '',
  password: '',
  confirm: ''
})

const loading = ref(true)
const saving = ref(false)
const error = ref('')
const notice = ref('')
const fileInput = ref(null)
const avatarFile = ref(null)
const avatarPreview = ref('')

const displayAvatar = computed(() => avatarPreview.value || resolveAvatar(store.user))

// 注册时间：后端字段是 created_at
const registeredAt = computed(() => {
  const raw = store.user?.created_at
  if (!raw) return ''
  const date = new Date(raw)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('zh-CN', { hour12: false })
})

async function load() {
  if (!store.isLoggedIn) {
    loading.value = false
    return
  }
  loading.value = true
  error.value = ''
  try {
    const me = await fetchMe()
    form.username = me.username || ''
    form.email = me.email || ''
    form.bio = me.bio || ''
    // 用最新数据刷新本地登录态（头像可能已被别的设备改过）
    store.updateUser({ username: me.username, email: me.email, bio: me.bio, avatar: me.avatar })
  } catch (err) {
    error.value = err.friendlyMessage || '读取资料失败'
  } finally {
    loading.value = false
  }
}

function onFile(event) {
  const file = event.target.files?.[0] || null
  avatarFile.value = file
  if (avatarPreview.value) URL.revokeObjectURL(avatarPreview.value)
  avatarPreview.value = file ? URL.createObjectURL(file) : ''
}

function validate() {
  const username = form.username.trim()
  const email = form.email.trim()

  // 规则与后端 express-validator 保持一致（3-30 位、字母数字下划线）
  if (username.length < 3 || username.length > 30) return '用户名长度应为 3-30 个字符'
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return '用户名只能包含字母、数字和下划线'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return '请输入正确的邮箱地址'
  if (form.password) {
    if (form.password.length < 6) return '密码长度至少 6 位'
    if (form.password !== form.confirm) return '两次输入的密码不一致'
  }
  return ''
}

async function save() {
  error.value = ''
  notice.value = ''

  const message = validate()
  if (message) {
    error.value = message
    return
  }

  saving.value = true
  try {
    const data = new FormData()
    data.append('username', form.username.trim())
    data.append('email', form.email.trim())
    data.append('bio', form.bio)
    if (form.password) data.append('password', form.password)
    if (avatarFile.value) data.append('avatar', avatarFile.value)

    const updated = await updateUser(store.userId, data)
    store.updateUser({
      username: updated.username,
      email: updated.email,
      bio: updated.bio,
      avatar: updated.avatar
    })

    // 保存成功后清空密码与预览，避免重复提交
    form.password = ''
    form.confirm = ''
    avatarFile.value = null
    if (fileInput.value) fileInput.value.value = ''
    if (avatarPreview.value) URL.revokeObjectURL(avatarPreview.value)
    avatarPreview.value = ''

    notice.value = '资料已更新'
  } catch (err) {
    error.value = err.friendlyMessage || '更新失败，请稍后重试'
  } finally {
    saving.value = false
  }
}

async function removeAccount() {
  if (!window.confirm('确定要注销账号吗？该账号的评论会一并删除，且无法恢复。')) return
  if (!window.confirm('再次确认：真的要注销吗？')) return

  try {
    await deleteUser(store.userId)
    store.logout()
    router.push('/')
  } catch (err) {
    error.value = err.friendlyMessage || '注销失败'
  }
}

onMounted(load)
</script>

<template>
  <main class="page-profile">
    <section v-if="!store.isLoggedIn" class="card guest">
      <h1>个人信息</h1>
      <p>请先登录后再查看和修改个人资料。</p>
      <router-link class="btn primary" to="/login">去登录</router-link>
    </section>

    <section v-else class="card">
      <header class="head">
        <h1>个人信息</h1>
        <p v-if="registeredAt" class="meta">注册时间：{{ registeredAt }}</p>
      </header>

      <p v-if="loading" class="state">读取中…</p>

      <form v-else class="form" @submit.prevent="save">
        <div class="avatar-row">
          <img class="avatar" :src="displayAvatar" alt="头像预览" @error="$event.target.src = ''" />
          <div class="avatar-side">
            <label class="label" for="avatar">头像</label>
            <input id="avatar" ref="fileInput" type="file" accept="image/png,image/jpeg" @change="onFile" />
            <p class="hint">支持 JPG / PNG，建议正方形图片，大小不超过 20MB。</p>
          </div>
        </div>

        <label class="label" for="username">用户名</label>
        <input id="username" v-model="form.username" type="text" autocomplete="username" />

        <label class="label" for="email">邮箱</label>
        <input id="email" v-model="form.email" type="email" autocomplete="email" />

        <label class="label" for="bio">个人简介</label>
        <textarea id="bio" v-model="form.bio" rows="3" maxlength="200" placeholder="最多 200 字" />

        <div class="grid2">
          <div>
            <label class="label" for="password">新密码（不修改可留空）</label>
            <input id="password" v-model="form.password" type="password" autocomplete="new-password" />
          </div>
          <div>
            <label class="label" for="confirm">确认新密码</label>
            <input id="confirm" v-model="form.confirm" type="password" autocomplete="new-password" />
          </div>
        </div>

        <p v-if="error" class="msg error">{{ error }}</p>
        <p v-else-if="notice" class="msg ok">{{ notice }}</p>

        <div class="actions">
          <button type="submit" class="btn primary" :disabled="saving">{{ saving ? '保存中…' : '保存修改' }}</button>
          <button type="button" class="btn danger" @click="removeAccount">注销账号</button>
          <router-link class="btn ghost" to="/">返回首页</router-link>
        </div>
      </form>
    </section>
  </main>
</template>

<style scoped>
.page-profile {
  min-height: 100vh;
  padding: 96px 0 60px;
  background: linear-gradient(180deg, #f8fbff 0%, #fdf4e6 55%, #f9ead8 100%);
  box-sizing: border-box;
}

.card {
  width: min(720px, 92vw);
  margin: 0 auto;
  padding: clamp(20px, 2.4vw, 34px);
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 14px 38px rgba(150, 115, 70, 0.14);
}

.guest {
  text-align: center;
}

.head h1 {
  margin: 0 0 6px;
  font-family: '幼圆', 'YouYuan', '微软雅黑', sans-serif;
  font-size: clamp(22px, 2vw, 28px);
  color: #33261a;
}

.meta {
  margin: 0 0 8px;
  color: #8a7761;
  font-size: 13px;
}

.state {
  margin: 0;
  padding: 30px 0;
  color: #6b5a45;
  text-align: center;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 14px;
}

.avatar-row {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.avatar {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  border: 3px solid #f3e3cb;
  object-fit: cover;
  background: #f7f2ea;
}

.avatar-side {
  flex: 1 1 260px;
  min-width: 0;
}

.label {
  display: block;
  margin: 12px 0 6px;
  color: #4a3b2c;
  font-size: 14px;
  font-weight: 700;
}

.avatar-side .label {
  margin-top: 0;
}

input[type='text'],
input[type='email'],
input[type='password'],
textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2d6c4;
  border-radius: 8px;
  background: #fffdf9;
  font-family: inherit;
  font-size: 15px;
  color: #33261a;
  box-sizing: border-box;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #e8863c;
  box-shadow: 0 0 0 3px rgba(232, 134, 60, 0.15);
}

textarea {
  resize: vertical;
}

.grid2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.hint {
  margin: 6px 0 0;
  color: #9a8b78;
  font-size: 12px;
  line-height: 1.6;
}

.msg {
  margin: 12px 0 0;
  font-size: 14px;
}

.error {
  color: #c0392b;
}

.ok {
  color: #2e7d32;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 20px;
}

.btn {
  display: inline-block;
  padding: 10px 22px;
  border: 0;
  border-radius: 999px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
  text-align: center;
  cursor: pointer;
  transition: transform 0.15s ease, background-color 0.15s ease;
}

.btn:hover {
  transform: translateY(-2px);
}

.primary {
  background: #e8863c;
  color: #fff;
}

.primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.danger {
  background: #fbe9e7;
  color: #c0392b;
}

.ghost {
  border: 2px solid #e8863c;
  color: #b96a26;
  background: transparent;
}

/* 窄屏把密码两列压成一列 */
@media (max-width: 640px) {
  .grid2 {
    grid-template-columns: 1fr;
  }
}
</style>
