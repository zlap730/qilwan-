<!--
  ProfileView.vue —— 个人中心
  路由：/profile（可带 ?tab=profile|avatar|security|comments）

  参考 B 站个人中心：顶部渐变头图 + 圆形头像 + 用户名/邮箱 + 成长进度条 + 4 项统计，
  下面是左侧菜单 + 右侧内容，共 5 个面板：
    个人中心（概览） / 修改资料（改用户名、邮箱、简介） / 更换头像 /
    登录与安全（改密码、忘记密码入口、注销账号） / 我的评论（筛选、编辑、删除）。
  对应旧站：个人信息.html + JS文件/个人信息.js（在此基础上扩展到个人中心）。

  数据来源：接口：GET /users/me、PUT /users/:id、PUT /users/me/password、GET /users/me/comments、PATCH/DELETE /comments/:id
-->
<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { deleteComment, updateComment } from '@/api/comments'
import { fetchMe, fetchMyComments, updateUser, changePassword, deleteUser } from '@/api/users'
import { useUserStore } from '@/stores/user'
import { resolveAvatar, formatTime } from '@/utils/asset'

/*
 * 个人中心：参考 B 站「个人中心」的布局（左侧菜单 + 右侧内容卡），
 * 把旧站的 HTML/个人信息.html 扩成 5 个面板：
 *   概览 / 修改资料 / 更换头像 / 登录与安全（改密码、注销） / 我的评论
 *
 * 四个需求对应关系：
 *   ① 更换头像  → avatar 面板，PUT /api/users/:id（multipart，字段 avatar）
 *   ② 更改账户名 → profile 面板，同一个 PUT，字段 username
 *   ③ 找回密码   → security 面板里的入口 → /forgot-password（邮箱验证码流程）
 *   ④ 评论管理   → comments 面板，GET /api/users/me/comments + PATCH/DELETE /api/comments/:id
 */

const route = useRoute()
const router = useRouter()
const store = useUserStore()
const { t } = useI18n()

const TABS = [
  { key: 'overview', label: '个人中心', icon: '🏠' },
  { key: 'profile', label: '修改资料', icon: '📝' },
  { key: 'avatar', label: '更换头像', icon: '🖼️' },
  { key: 'security', label: '登录与安全', icon: '🔒' },
  { key: 'comments', label: '我的评论', icon: '💬' }
]

const tab = ref(TABS.some((item) => item.key === route.query.tab) ? route.query.tab : 'overview')

// 切换面板时写进 URL，刷新/分享还能停在同一个面板
watch(tab, (value) => {
  router.replace({ query: { ...route.query, tab: value === 'overview' ? undefined : value } })
})

const me = ref(null)
const loading = ref(true)
const error = ref('')
const notice = ref('')

const profileForm = reactive({ username: '', email: '', bio: '' })
const passwordForm = reactive({ oldPassword: '', newPassword: '', confirm: '' })

const avatarFile = ref(null)
const avatarPreview = ref('')
const fileInput = ref(null)
const saving = ref(false)

const comments = ref([])
const commentStats = ref({ total: 0, active: 0, deleted: 0 })
const commentsLoading = ref(false)
const commentFilter = ref('')
const editingId = ref(null)
const editingText = ref('')

function flash(message) {
  notice.value = message
  error.value = ''
  setTimeout(() => {
    if (notice.value === message) notice.value = ''
  }, 2600)
}

const avatarSrc = computed(() => avatarPreview.value || resolveAvatar(me.value || store.user))

const joinedDays = computed(() => {
  const raw = me.value?.created_at || store.user?.created_at
  if (!raw) return 1
  const days = Math.ceil((Date.now() - new Date(raw).getTime()) / 86400000)
  return Number.isNaN(days) ? 1 : Math.max(days, 1)
})

// 类似 B 站的「成长值」进度条：加入天数 / 30 天
const growthPercent = computed(() => Math.min(Math.round((joinedDays.value / 30) * 100), 100))

const displayComments = computed(() => {
  if (!commentFilter.value) return comments.value
  return comments.value.filter((item) => item.status === commentFilter.value)
})

async function loadMe() {
  loading.value = true
  error.value = ''
  try {
    const data = await fetchMe()
    me.value = data
    profileForm.username = data.username || ''
    profileForm.email = data.email || ''
    profileForm.bio = data.bio || ''
    store.updateUser({
      username: data.username,
      email: data.email,
      bio: data.bio,
      avatar: data.avatar
    })
  } catch (err) {
    error.value = err.friendlyMessage || '读取资料失败'
  } finally {
    loading.value = false
  }
}

async function loadComments() {
  commentsLoading.value = true
  try {
    const data = await fetchMyComments()
    comments.value = data.items || []
    commentStats.value = { total: data.total, active: data.active, deleted: data.deleted }
  } catch (err) {
    error.value = err.friendlyMessage || '读取评论失败'
  } finally {
    commentsLoading.value = false
  }
}

function validateProfile() {
  const username = profileForm.username.trim()
  const email = profileForm.email.trim()
  if (username.length < 3 || username.length > 30) return '用户名长度应为 3-30 个字符'
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return '用户名只能包含字母、数字和下划线'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return '请输入正确的邮箱地址'
  return ''
}

// ② 修改资料（用户名 / 邮箱 / 简介）
async function saveProfile() {
  error.value = ''
  const message = validateProfile()
  if (message) {
    error.value = message
    return
  }

  saving.value = true
  try {
    const data = new FormData()
    data.append('username', profileForm.username.trim())
    data.append('email', profileForm.email.trim())
    data.append('bio', profileForm.bio)

    const updated = await updateUser(store.userId, data)
    me.value = updated
    store.updateUser({
      username: updated.username,
      email: updated.email,
      bio: updated.bio,
      avatar: updated.avatar
    })
    flash('资料已保存')
  } catch (err) {
    error.value = err.friendlyMessage || '保存失败，请稍后重试'
  } finally {
    saving.value = false
  }
}

// ① 更换头像
function onAvatarChange(event) {
  const file = event.target.files?.[0] || null
  if (!file) return
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    error.value = '头像只支持 JPG / PNG'
    return
  }
  if (file.size > 20 * 1024 * 1024) {
    error.value = '头像不能超过 20MB'
    return
  }
  avatarFile.value = file
  if (avatarPreview.value) URL.revokeObjectURL(avatarPreview.value)
  avatarPreview.value = URL.createObjectURL(file)
  error.value = ''
}

async function uploadAvatar() {
  if (!avatarFile.value) {
    error.value = '请先选择一张图片'
    return
  }
  saving.value = true
  error.value = ''
  try {
    const data = new FormData()
    data.append('avatar', avatarFile.value)
    const updated = await updateUser(store.userId, data)

    me.value = updated
    store.updateUser({ avatar: updated.avatar })
    avatarFile.value = null
    if (fileInput.value) fileInput.value.value = ''
    if (avatarPreview.value) URL.revokeObjectURL(avatarPreview.value)
    avatarPreview.value = ''
    flash('头像已更新')
  } catch (err) {
    error.value = err.friendlyMessage || '头像上传失败'
  } finally {
    saving.value = false
  }
}

// 改密码（需要旧密码）
async function submitPassword() {
  error.value = ''
  if (!passwordForm.oldPassword || !passwordForm.newPassword) {
    error.value = '请填写原密码和新密码'
    return
  }
  if (passwordForm.newPassword.length < 6) {
    error.value = '新密码长度至少 6 位'
    return
  }
  if (passwordForm.newPassword !== passwordForm.confirm) {
    error.value = '两次输入的新密码不一致'
    return
  }

  saving.value = true
  try {
    await changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirm = ''
    flash('密码已更新，下次登录请用新密码')
  } catch (err) {
    error.value = err.friendlyMessage || '修改密码失败'
  } finally {
    saving.value = false
  }
}

// ④ 评论管理：编辑 / 删除
function startEdit(comment) {
  editingId.value = comment.id
  editingText.value = comment.content || ''
}

function cancelEdit() {
  editingId.value = null
  editingText.value = ''
}

async function saveEdit(comment) {
  const text = editingText.value.trim()
  if (!text) {
    error.value = '评论内容不能为空'
    return
  }
  try {
    const updated = await updateComment(comment.id, text)
    comment.content = updated.content
    cancelEdit()
    flash('评论已更新')
  } catch (err) {
    error.value = err.friendlyMessage || '编辑失败'
  }
}

async function removeComment(comment) {
  if (!window.confirm('确定删除这条评论吗？（删除后自己仍可在「已删除」里看到）')) return
  try {
    await deleteComment(comment.id)
    comment.status = 'deleted'
    commentStats.value.active -= 1
    commentStats.value.deleted += 1
    flash('评论已删除')
  } catch (err) {
    error.value = err.friendlyMessage || '删除失败'
  }
}

async function removeAccount() {
  if (!window.confirm('确定注销账号吗？该账号的所有评论会一并删除，且无法恢复。')) return
  if (!window.confirm('再次确认：真的要注销吗？')) return
  try {
    await deleteUser(store.userId)
    store.logout()
    router.push('/')
  } catch (err) {
    error.value = err.friendlyMessage || '注销失败'
  }
}

function switchTab(key) {
  tab.value = key
  error.value = ''
  if (key === 'comments' && !comments.value.length) loadComments()
}

onMounted(() => {
  if (!store.isLoggedIn) {
    loading.value = false
    return
  }
  loadMe()
  // 概览里的「评论总数」也要有数，所以进来就把评论统计一起拉一次
  loadComments()
})
</script>

<template>
  <main class="page-center">
    <!-- 未登录：给一个明确的入口，不要留下空白页 -->
    <section v-if="!store.isLoggedIn" class="card guest">
      <h1>个人中心</h1>
      <p>请先登录后再查看和修改个人资料。</p>
      <router-link class="btn primary" to="/login">去登录</router-link>
    </section>

    <template v-else>
      <!-- ── 顶部信息条（参考图里的头图 + 头像 + 等级条）── -->
      <header class="banner">
        <div class="banner-bg" />
        <div class="banner-main">
          <img class="avatar" :src="avatarSrc" alt="头像" @error="(e) => (e.target.src = '')" />
          <div class="who">
            <h1>{{ me?.username || store.displayName }}</h1>
            <p class="email">{{ me?.email }}</p>
            <div class="growth">
              <span class="growth-bar"><i :style="{ width: `${growthPercent}%` }" /></span>
              <span class="growth-text">已加入 {{ joinedDays }} 天</span>
            </div>
          </div>
          <button type="button" class="btn ghost" @click="switchTab('profile')">修改资料</button>
        </div>

        <dl class="stats">
          <div><dt>{{ commentStats.total || 0 }}</dt><dd>评论总数</dd></div>
          <div><dt>{{ commentStats.active || 0 }}</dt><dd>有效评论</dd></div>
          <div><dt>{{ commentStats.deleted || 0 }}</dt><dd>已删除</dd></div>
          <div><dt>{{ joinedDays }}</dt><dd>加入天数</dd></div>
        </dl>
      </header>

      <div class="layout">
        <!-- ── 左侧菜单 ── -->
        <nav class="side">
          <button
            v-for="item in TABS"
            :key="item.key"
            type="button"
            class="side-item"
            :class="{ active: tab === item.key }"
            @click="switchTab(item.key)"
          >
            <span class="side-icon">{{ item.icon }}</span>
            {{ item.label }}
          </button>
        </nav>

        <!-- ── 右侧内容 ── -->
        <section class="content">
          <p v-if="loading" class="state">读取中…</p>

          <template v-else>
            <p v-if="error" class="msg error">{{ error }}</p>
            <p v-else-if="notice" class="msg ok">{{ notice }}</p>

            <!-- 概览 -->
            <div v-if="tab === 'overview'" class="panel">
              <h2>欢迎回来，{{ me?.username || store.displayName }}</h2>
              <p class="desc">{{ me?.bio || '还没有填写简介，去「修改资料」补一句吧。' }}</p>

              <ul class="facts">
                <li><span>用户名</span><b>{{ me?.username }}</b></li>
                <li><span>邮箱</span><b>{{ me?.email }}</b></li>
                <li><span>注册时间</span><b>{{ formatTime(me?.created_at) }}</b></li>
                <li><span>我的评论</span><b>{{ commentStats.total }} 条（有效 {{ commentStats.active }}）</b></li>
              </ul>

              <div class="quick">
                <button type="button" class="btn primary" @click="switchTab('comments')">管理我的评论</button>
                <button type="button" class="btn ghost" @click="switchTab('avatar')">更换头像</button>
                <button type="button" class="btn ghost" @click="switchTab('security')">修改密码</button>
              </div>
            </div>

            <!-- ② 修改资料 -->
            <div v-else-if="tab === 'profile'" class="panel">
              <h2>修改资料</h2>
              <form class="form" @submit.prevent="saveProfile">
                <label class="label" for="username">用户名</label>
                <input id="username" v-model="profileForm.username" type="text" autocomplete="username" />
                <p class="hint">3-30 位，只能包含字母、数字和下划线。</p>

                <label class="label" for="email">邮箱</label>
                <input id="email" v-model="profileForm.email" type="email" autocomplete="email" />
                <p class="hint">找回密码的验证码会发到这个邮箱，请填常用的。</p>

                <label class="label" for="bio">个人简介</label>
                <textarea id="bio" v-model="profileForm.bio" rows="3" maxlength="200" placeholder="最多 200 字" />

                <button type="submit" class="btn primary" :disabled="saving">
                  {{ saving ? '保存中…' : '保存修改' }}
                </button>
              </form>
            </div>

            <!-- ① 更换头像 -->
            <div v-else-if="tab === 'avatar'" class="panel">
              <h2>更换头像</h2>
              <div class="avatar-panel">
                <img class="avatar-preview" :src="avatarSrc" alt="头像预览" />
                <div class="avatar-actions">
                  <input ref="fileInput" type="file" accept="image/png,image/jpeg" @change="onAvatarChange" />
                  <p class="hint">支持 JPG / PNG，建议正方形，大小不超过 20MB。</p>
                  <div class="row">
                    <button type="button" class="btn primary" :disabled="saving || !avatarFile" @click="uploadAvatar">
                      {{ saving ? '上传中…' : '保存头像' }}
                    </button>
                    <button type="button" class="btn ghost" @click="switchTab('overview')">返回概览</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- ③ 登录与安全 -->
            <div v-else-if="tab === 'security'" class="panel">
              <h2>修改密码</h2>
              <form class="form" @submit.prevent="submitPassword">
                <label class="label" for="oldPassword">原密码</label>
                <input id="oldPassword" v-model="passwordForm.oldPassword" type="password" autocomplete="current-password" />

                <label class="label" for="newPassword">新密码</label>
                <input id="newPassword" v-model="passwordForm.newPassword" type="password" autocomplete="new-password" />
                <p class="hint">至少 6 位，不能和原密码相同。</p>

                <label class="label" for="confirmPassword">确认新密码</label>
                <input id="confirmPassword" v-model="passwordForm.confirm" type="password" autocomplete="new-password" />

                <button type="submit" class="btn primary" :disabled="saving">
                  {{ saving ? '提交中…' : '更新密码' }}
                </button>
              </form>

              <div class="tip-box">
                <p>想不起原密码？可以直接走「忘记密码」，用邮箱验证码重置。</p>
                <router-link class="btn ghost" to="/forgot-password">忘记密码 →</router-link>
              </div>

              <h2 class="danger-title">注销账号</h2>
              <p class="hint">注销后账号和该账号下的评论都会被删除，无法恢复。</p>
              <button type="button" class="btn danger" @click="removeAccount">注销账号</button>
            </div>

            <!-- ④ 我的评论 -->
            <div v-else-if="tab === 'comments'" class="panel">
              <div class="panel-head">
                <h2>我的评论</h2>
                <span class="count">共 {{ commentStats.total }} 条</span>
              </div>

              <div class="filters">
                <button
                  v-for="item in [
                    { key: '', label: `全部 ${commentStats.total}` },
                    { key: 'active', label: `有效 ${commentStats.active}` },
                    { key: 'deleted', label: `已删除 ${commentStats.deleted}` }
                  ]"
                  :key="item.key"
                  type="button"
                  class="chip"
                  :class="{ active: commentFilter === item.key }"
                  @click="commentFilter = item.key"
                >
                  {{ item.label }}
                </button>
                <button type="button" class="chip" :disabled="commentsLoading" @click="loadComments">
                  {{ commentsLoading ? '刷新中…' : '刷新' }}
                </button>
              </div>

              <p v-if="commentsLoading" class="state">评论加载中…</p>
              <p v-else-if="!displayComments.length" class="state">
                还没有评论。去<router-link to="/forum">讨论区</router-link>聊聊吧。
              </p>

              <article v-for="item in displayComments" :key="item.id" class="comment">
                <header class="comment-head">
                  <span class="badge" :class="item.status">{{ item.status === 'active' ? '有效' : '已删除' }}</span>
                  <span class="time">{{ formatTime(item.created_at) }}</span>
                  <span class="target">目标：{{ item.targetId || '默认' }}</span>
                </header>

                <template v-if="editingId === item.id">
                  <textarea v-model="editingText" rows="3" maxlength="1000" />
                  <div class="comment-actions">
                    <button type="button" class="btn primary small" @click="saveEdit(item)">保存</button>
                    <button type="button" class="btn ghost small" @click="cancelEdit">取消</button>
                  </div>
                </template>

                <template v-else>
                  <p class="comment-text">{{ item.content }}</p>
                  <div v-if="item.images?.length" class="comment-images">
                    <img v-for="img in item.images" :key="img.id" :src="img.imageUrl" alt="评论图片" />
                  </div>
                  <div class="comment-actions">
                    <button
                      v-if="item.status === 'active'"
                      type="button"
                      class="btn ghost small"
                      @click="startEdit(item)"
                    >
                      编辑
                    </button>
                    <button
                      v-if="item.status === 'active'"
                      type="button"
                      class="btn danger small"
                      @click="removeComment(item)"
                    >
                      删除
                    </button>
                    <span v-else class="hint">已删除的评论不能编辑或再次删除</span>
                  </div>
                </template>
              </article>
            </div>
          </template>
        </section>
      </div>
    </template>
  </main>
</template>

<style scoped>
.page-center {
  min-height: 100vh;
  padding: 84px 0 60px;
  background: linear-gradient(180deg, #f6fafd 0%, #fdf4e6 55%, #f9ead8 100%);
  box-sizing: border-box;
}

/* ── 顶部信息条 ── */
.banner {
  position: relative;
  width: min(1180px, 94vw);
  margin: 0 auto;
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 14px 38px rgba(150, 115, 70, 0.14);
}

.banner-bg {
  height: 120px;
  background:
    radial-gradient(1200px 120px at 20% 0%, rgba(255, 255, 255, 0.35), transparent 70%),
    linear-gradient(120deg, #7fb6e8 0%, #a8cdf0 45%, #f7c98b 100%);
}

.banner-main {
  display: flex;
  align-items: flex-end;
  gap: 18px;
  padding: 0 clamp(16px, 2vw, 28px) 16px;
  margin-top: -46px;
  position: relative;
}

.avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  border: 4px solid #fff;
  object-fit: cover;
  background: #f2ede6;
  box-shadow: 0 6px 18px rgba(40, 60, 90, 0.18);
  flex: 0 0 auto;
}

.who {
  flex: 1 1 auto;
  min-width: 0;
  padding-bottom: 4px;
}

.who h1 {
  margin: 0 0 4px;
  font-size: clamp(20px, 1.8vw, 26px);
  color: #22303f;
}

.email {
  margin: 0 0 8px;
  color: #7b8794;
  font-size: 13px;
}

.growth {
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 420px;
}

.growth-bar {
  position: relative;
  flex: 1 1 auto;
  height: 10px;
  border-radius: 999px;
  background: #eef1f5;
  overflow: hidden;
}

.growth-bar i {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #ffb56b, #ff8a3d);
  transition: width 0.4s ease;
}

.growth-text {
  flex: 0 0 auto;
  color: #8a7761;
  font-size: 12px;
}

/* 统计块 */
.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  margin: 0;
  background: #f0ebe3;
  border-top: 1px solid #f0ebe3;
}

.stats > div {
  padding: 14px 10px;
  background: #fff;
  text-align: center;
}

.stats dt {
  font-size: clamp(18px, 1.6vw, 22px);
  font-weight: 800;
  color: #22303f;
}

.stats dd {
  margin: 2px 0 0;
  color: #8a7761;
  font-size: 12px;
}

/* ── 两栏布局 ── */
.layout {
  display: grid;
  grid-template-columns: 200px minmax(0, 1fr);
  gap: 18px;
  width: min(1180px, 94vw);
  margin: 18px auto 0;
  align-items: start;
}

.side {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 10px 26px rgba(150, 115, 70, 0.1);
  position: sticky;
  top: 76px;
}

.side-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 11px 12px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: #4a3b2c;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.side-item:hover {
  background: #fdf3e3;
}

.side-item.active {
  background: #fdeee0;
  color: #c45d16;
}

.side-icon {
  font-size: 15px;
}

.content {
  min-width: 0;
  padding: clamp(18px, 2.2vw, 28px);
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 10px 26px rgba(150, 115, 70, 0.1);
}

.panel h2 {
  margin: 0 0 14px;
  font-size: clamp(18px, 1.6vw, 22px);
  color: #22303f;
}

.desc {
  margin: 0 0 18px;
  color: #6b5a45;
  font-size: 14px;
  line-height: 1.9;
}

.facts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 10px 18px;
  margin: 0 0 20px;
  padding: 0;
  list-style: none;
}

.facts li {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #fbf8f3;
}

.facts span {
  color: #9a8b78;
  font-size: 12px;
}

.facts b {
  color: #33261a;
  font-size: 14px;
  word-break: break-all;
}

.quick,
.row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

/* 表单 */
.form {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 460px;
}

.label {
  margin: 10px 0 6px;
  color: #4a3b2c;
  font-size: 14px;
  font-weight: 700;
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

.hint {
  margin: 4px 0 0;
  color: #9a8b78;
  font-size: 12px;
  line-height: 1.7;
}

/* 头像面板 */
.avatar-panel {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.avatar-preview {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid #f3e3cb;
  object-fit: cover;
  background: #f7f2ea;
}

.avatar-actions {
  flex: 1 1 280px;
  min-width: 0;
}

/* 安全面板 */
.tip-box {
  margin: 22px 0;
  padding: 14px 16px;
  border-radius: 10px;
  background: #fdf7ee;
  border: 1px dashed #e6d7c2;
}

.tip-box p {
  margin: 0 0 10px;
  color: #6b5a45;
  font-size: 14px;
  line-height: 1.8;
}

.danger-title {
  margin-top: 26px !important;
  padding-top: 18px;
  border-top: 1px solid #f0e3d1;
  color: #b03a2e !important;
}

/* 评论管理 */
.panel-head {
  display: flex;
  align-items: baseline;
  gap: 10px;
  justify-content: space-between;
}

.count {
  color: #8a7761;
  font-size: 13px;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 6px 0 16px;
}

.chip {
  padding: 6px 14px;
  border: 1px solid #eee2d1;
  border-radius: 999px;
  background: #fffdf9;
  color: #7a6248;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.chip.active {
  border-color: #e8863c;
  background: #e8863c;
  color: #fff;
}

.comment {
  padding: 14px 16px;
  margin-bottom: 12px;
  border-radius: 12px;
  background: #fbf8f3;
}

.comment-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  color: #8a7761;
  font-size: 12px;
}

.badge {
  padding: 2px 8px;
  border-radius: 999px;
  font-weight: 700;
}

.badge.active {
  background: rgba(46, 125, 50, 0.12);
  color: #2e7d32;
}

.badge.deleted {
  background: rgba(192, 57, 43, 0.1);
  color: #c0392b;
}

.comment-text {
  margin: 0 0 8px;
  color: #33261a;
  font-size: 15px;
  line-height: 1.9;
  white-space: pre-wrap;
  word-break: break-word;
}

.comment-images {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.comment-images img {
  width: 96px;
  height: 96px;
  object-fit: cover;
  border-radius: 8px;
}

.comment-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.state {
  margin: 0;
  padding: 24px 0;
  color: #7a6248;
  text-align: center;
  font-size: 14px;
}

.msg {
  margin: 0 0 14px;
  font-size: 14px;
}

.error {
  color: #c0392b;
}

.ok {
  color: #2e7d32;
}

/* 按钮 */
.btn {
  display: inline-block;
  padding: 9px 20px;
  border: 0;
  border-radius: 999px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  text-align: center;
  cursor: pointer;
  transition: transform 0.15s ease, background-color 0.15s ease;
}

.btn:hover {
  transform: translateY(-2px);
}

.btn.small {
  padding: 6px 14px;
  font-size: 13px;
}

.primary {
  background: #e8863c;
  color: #fff;
}

.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.ghost {
  background: #fff;
  border: 1px solid #e8c9a6;
  color: #b96a26;
}

.danger {
  background: #fbe9e7;
  color: #c0392b;
}

.card {
  width: min(560px, 92vw);
  margin: 40px auto 0;
  padding: clamp(20px, 2.4vw, 32px);
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 14px 38px rgba(150, 115, 70, 0.14);
  text-align: center;
}

.guest h1 {
  margin: 0 0 10px;
  font-size: 22px;
  color: #33261a;
}

.guest p {
  margin: 0 0 18px;
  color: #6b5a45;
  font-size: 14px;
}

/* ── 窄屏：菜单变横向 chips ── */
@media (max-width: 900px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .side {
    position: static;
    flex-direction: row;
    overflow-x: auto;
    gap: 6px;
  }

  .side-item {
    white-space: nowrap;
    padding: 9px 12px;
  }

  .stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .banner-main {
    flex-wrap: wrap;
  }
}
</style>
