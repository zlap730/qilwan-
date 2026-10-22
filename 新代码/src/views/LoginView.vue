<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { login as loginApi, register as registerApi } from '@/api/auth'
import bgImage from '@/assets/img/单车与日落.jpg'
import { useUserStore } from '@/stores/user'
import '@/assets/legacy/登陆页面.css'

const router = useRouter()
const store = useUserStore()

const mode = ref('login')
const busy = ref(false)
const error = ref('')
const notice = ref('')

const form = reactive({
  identifier: '',
  password: '',
  username: '',
  email: '',
  confirm: ''
})

function switchMode(next) {
  mode.value = next
  error.value = ''
  notice.value = ''
}

async function submitLogin() {
  error.value = ''
  if (!form.identifier.trim() || !form.password) {
    error.value = '请输入账号和密码'
    return
  }

  busy.value = true
  try {
    const data = await loginApi({ identifier: form.identifier.trim(), password: form.password })
    store.setSession({ token: data.token, user: data.user })
    router.push('/forum')
  } catch (err) {
    error.value = err.friendlyMessage || '用户名或密码错误，请重试'
  } finally {
    busy.value = false
  }
}

async function submitRegister() {
  error.value = ''
  const username = form.username.trim()
  const email = form.email.trim()

  // 原来前端写的是 2-30 位，后端 express-validator 是 3-30 位，导致 2 位用户名能通过前端但被后端拒绝。
  // 迁移时以「后端为准」，两边只留一份规则。
  if (!username || !form.password || !email) {
    error.value = '请输入用户名、密码和邮箱'
    return
  }
  if (username.length < 3 || username.length > 30) {
    error.value = '用户名长度应为 3-30 个字符'
    return
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    error.value = '用户名只能包含字母、数字和下划线'
    return
  }
  if (form.password.length < 6) {
    error.value = '密码长度至少 6 位'
    return
  }
  if (form.password !== form.confirm) {
    error.value = '两次输入的密码不一致，请重试'
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    error.value = '请输入正确的邮箱地址'
    return
  }

  busy.value = true
  try {
    await registerApi({ username, password: form.password, email })
    form.identifier = username
    form.password = ''
    form.confirm = ''
    mode.value = 'login'
    notice.value = '注册成功，请登录'
  } catch (err) {
    error.value = err.friendlyMessage || '注册失败，请稍后重试'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <main class="page-login" :style="{ backgroundImage: `url(${bgImage})` }">
    <div class="page-login-mask" />

    <!-- 原来是 video 背景 + 两个 div 靠 style.display 切换，这里换成 v-if + <form>，
         顺带就有了「回车提交」和浏览器自带的密码管理器支持 -->
    <form v-if="mode === 'login'" id="登录窗口" class="login-card" @submit.prevent="submitLogin">
      <h2>登录</h2>
      <input v-model="form.identifier" class="input_text" type="text" placeholder="账号" autocomplete="username" />
      <input
        v-model="form.password"
        class="input_text"
        type="password"
        placeholder="密码"
        autocomplete="current-password"
      />
      <p v-if="error" class="form-msg error">{{ error }}</p>
      <p v-else-if="notice" class="form-msg ok">{{ notice }}</p>
      <button type="submit" id="but_join" :disabled="busy">{{ busy ? '登录中…' : '登录' }}</button>
      <a href="#" class="zc" @click.prevent="switchMode('register')">注册</a>
    </form>

    <form v-else id="注册窗口" class="login-card" @submit.prevent="submitRegister">
      <h2>注册账号</h2>
      <input v-model="form.username" class="zc_text" type="text" placeholder="账号" autocomplete="username" />
      <input
        v-model="form.password"
        class="zc_text"
        type="password"
        placeholder="密码"
        autocomplete="new-password"
      />
      <input
        v-model="form.confirm"
        class="zc_text"
        type="password"
        placeholder="确认密码"
        autocomplete="new-password"
      />
      <input v-model="form.email" class="zc_text" type="email" placeholder="邮箱" autocomplete="email" />
      <p v-if="error" class="form-msg error">{{ error }}</p>
      <button type="submit" class="zcc" :disabled="busy">{{ busy ? '提交中…' : '注册' }}</button>
      <a href="#" id="loginLink" @click.prevent="switchMode('login')">返回登录</a>
    </form>

    <router-link class="back-home" to="/" >← 返回首页</router-link>
  </main>
</template>

<style scoped>
.page-login {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 40px 16px;
  background-position: center;
  background-size: cover;
}

.page-login-mask {
  position: absolute;
  inset: 0;
  background: rgba(20, 24, 30, 0.45);
}

/* 原 CSS 用 #登录窗口{top:200px} 定位，这里改成 flex 居中，其余样式沿用 登陆页面.css */
.login-card {
  position: relative;
  top: 0;
  z-index: 1;
  height: auto;
  min-height: 200px;
}

.form-msg {
  margin: 8px 20px 0;
  padding-left: 4px;
  font-size: 13px;
  text-align: left;
}

.error {
  color: #c0392b;
}

.ok {
  color: #2e7d32;
}
#but_join{
  padding : 0
}

#but_join,
.zcc {
  cursor: pointer;
}

#but_join:disabled,
.zcc:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.back-home {
  position: absolute;
  top: 24px;
  left: 28px;
  z-index: 1;
  color: #fff;
  font-size: 15px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.6);
}
.back-home:hover{
  color:rgba(60, 60, 60, 0.6);
  transition: all 0.1s ease;
}
</style>
