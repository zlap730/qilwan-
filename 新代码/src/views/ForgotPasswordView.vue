<!--
  ForgotPasswordView.vue —— 找回密码（邮箱验证码）
  路由：/forgot-password

  两步：① 输入注册邮箱 → 后端发 6 位验证码；② 输入验证码 + 新密码 → 重置密码。
  后端没配置 SMTP 时走开发模式，页面会直接显示验证码方便本地调试。
  登录页的「忘记密码？」入口跳到这里。属于旧站没有的新增功能。

  数据来源：接口：POST /api/auth/forgot-password、POST /api/auth/reset-password
-->
<script setup>
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { forgotPassword, resetPassword } from '@/api/auth'
import bgImage from '@/assets/img/单车与日落.jpg'

/*
 * 忘记密码 / 重置密码：两步流程
 *   ① 输入注册邮箱 → 后端生成 6 位验证码（10 分钟有效、60 秒冷却）
 *   ② 输入验证码 + 新密码 → 后端校验后改密
 *
 * 后端未配置 SMTP 时会在响应里带 devCode（仅开发用），这里会直接显示出来，
 * 本地没有邮箱服务也能把流程走通。
 */

const router = useRouter()

const step = ref(1)
const email = ref('')
const code = ref('')
const form = reactive({ password: '', confirm: '' })

const busy = ref(false)
const error = ref('')
const notice = ref('')
const devCode = ref('')

// 重发倒计时（和后端 60 秒冷却保持一致）
const countdown = ref(0)
let timer = null

const canSend = computed(() => countdown.value === 0 && !busy.value)

function startCountdown() {
  countdown.value = 60
  clearInterval(timer)
  timer = setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0) clearInterval(timer)
  }, 1000)
}

async function sendCode() {
  error.value = ''
  notice.value = ''
  devCode.value = ''

  const value = email.value.trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    error.value = '请输入正确的邮箱地址'
    return
  }

  busy.value = true
  try {
    const data = await forgotPassword(value)
    notice.value = data.message || '验证码已发送'
    if (data.devCode) devCode.value = data.devCode
    step.value = 2
    startCountdown()
  } catch (err) {
    error.value = err.friendlyMessage || '发送失败，请稍后重试'
  } finally {
    busy.value = false
  }
}

async function submitReset() {
  error.value = ''
  notice.value = ''

  if (!/^\d{6}$/.test(code.value.trim())) {
    error.value = '请输入 6 位数字验证码'
    return
  }
  if (form.password.length < 6) {
    error.value = '新密码长度至少 6 位'
    return
  }
  if (form.password !== form.confirm) {
    error.value = '两次输入的新密码不一致'
    return
  }

  busy.value = true
  try {
    await resetPassword({
      email: email.value.trim(),
      code: code.value.trim(),
      password: form.password
    })
    notice.value = '密码已重置，正在跳转登录…'
    setTimeout(() => router.push('/login'), 1200)
  } catch (err) {
    error.value = err.friendlyMessage || '重置失败，请检查验证码'
  } finally {
    busy.value = false
  }
}

function backToEmail() {
  step.value = 1
  code.value = ''
  error.value = ''
  notice.value = ''
}

onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <main class="page-forgot" :style="{ backgroundImage: `url(${bgImage})` }">
    <div class="mask" />

    <section class="card">
      <header class="head">
        <p class="kicker">PASSWORD RESET</p>
        <h1>{{ step === 1 ? '找回密码' : '重置密码' }}</h1>
        <p class="sub">
          {{ step === 1
            ? '输入注册时使用的邮箱，我们会发一封包含 6 位验证码的邮件。'
            : `验证码已发送到 ${email}，10 分钟内有效。` }}
        </p>
      </header>

      <p v-if="error" class="msg error">{{ error }}</p>
      <p v-else-if="notice" class="msg ok">{{ notice }}</p>

      <!-- 第一步：发验证码 -->
      <form v-if="step === 1" class="form" @submit.prevent="sendCode">
        <label class="label" for="email">注册邮箱</label>
        <input id="email" v-model="email" type="email" autocomplete="email" placeholder="you@example.com" />

        <button type="submit" class="btn primary" :disabled="busy">
          {{ busy ? '发送中…' : '发送验证码' }}
        </button>
      </form>

      <!-- 第二步：验证码 + 新密码 -->
      <form v-else class="form" @submit.prevent="submitReset">
        <label class="label" for="code">邮箱验证码</label>
        <input
          id="code"
          v-model="code"
          type="text"
          inputmode="numeric"
          maxlength="6"
          placeholder="6 位数字"
          autocomplete="one-time-code"
        />

        <p v-if="devCode" class="dev-code">
          开发模式（后端未配置 SMTP）：本次验证码是 <b>{{ devCode }}</b>
        </p>

        <label class="label" for="password">新密码</label>
        <input id="password" v-model="form.password" type="password" autocomplete="new-password" placeholder="至少 6 位" />

        <label class="label" for="confirm">确认新密码</label>
        <input id="confirm" v-model="form.confirm" type="password" autocomplete="new-password" />

        <button type="submit" class="btn primary" :disabled="busy">
          {{ busy ? '提交中…' : '重置密码' }}
        </button>

        <div class="foot">
          <button type="button" class="link" :disabled="!canSend" @click="sendCode">
            {{ countdown > 0 ? `${countdown} 秒后可重新发送` : '重新发送验证码' }}
          </button>
          <button type="button" class="link" @click="backToEmail">换个邮箱</button>
        </div>
      </form>

      <p class="back">
        <router-link to="/login">← 返回登录</router-link>
      </p>
    </section>
  </main>
</template>

<style scoped>
.page-forgot {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 40px 16px;
  background-position: center;
  background-size: cover;
  box-sizing: border-box;
}

.mask {
  position: absolute;
  inset: 0;
  background: rgba(20, 24, 30, 0.45);
}

.card {
  position: relative;
  z-index: 1;
  width: min(440px, 92vw);
  padding: clamp(22px, 2.6vw, 34px);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.28);
  box-sizing: border-box;
}

.head {
  margin-bottom: 18px;
}

.kicker {
  margin: 0 0 8px;
  color: #c47a2c;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 4px;
}

.head h1 {
  margin: 0 0 8px;
  font-family: '幼圆', 'YouYuan', '微软雅黑', sans-serif;
  font-size: clamp(22px, 2vw, 28px);
  color: #33261a;
}

.sub {
  margin: 0;
  color: #6b5a45;
  font-size: 13px;
  line-height: 1.8;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label {
  margin: 10px 0 6px;
  color: #4a3b2c;
  font-size: 14px;
  font-weight: 700;
}

input {
  width: 100%;
  padding: 11px 12px;
  border: 1px solid #e2d6c4;
  border-radius: 8px;
  background: #fffdf9;
  font-family: inherit;
  font-size: 15px;
  color: #33261a;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #e8863c;
  box-shadow: 0 0 0 3px rgba(232, 134, 60, 0.15);
}

.btn {
  margin-top: 16px;
  padding: 11px 20px;
  border: 0;
  border-radius: 999px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

.primary {
  background: #e8863c;
  color: #fff;
}

.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.msg {
  margin: 0 0 6px;
  font-size: 13px;
  line-height: 1.7;
}

.error {
  color: #c0392b;
}

.ok {
  color: #2e7d32;
}

.dev-code {
  margin: 8px 0 0;
  padding: 8px 10px;
  border-radius: 8px;
  background: #fff6e6;
  color: #8a5a1f;
  font-size: 12px;
  line-height: 1.7;
}

.dev-code b {
  font-size: 14px;
  letter-spacing: 2px;
}

.foot {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 12px;
}

.link {
  padding: 0;
  border: 0;
  background: transparent;
  color: #b96a26;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.link:disabled {
  color: #b8ada0;
  cursor: not-allowed;
}

.back {
  margin: 18px 0 0;
  text-align: center;
}

.back a {
  color: #7a6248;
  font-size: 13px;
  text-decoration: none;
}
</style>
