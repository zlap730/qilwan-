<!--
  ForumView.vue —— 讨论区
  路由：/forum

  功能：
    · 评论列表（楼中楼：可以回复别人的评论，显示「回复 @某人」）
    · 发评论：文字 + 最多 9 张图 + 1 个视频（≤50MB、建议 ≤60 秒）
    · 图片九宫格 / 视频播放 / 点图放大 / 删除自己的评论
    · 未登录可以浏览，登录后才能发言
  对应旧站：论坛.html + JS文件/评论区代码.js。

  数据来源：接口 GET/POST /api/comments、DELETE /api/comments/:id；
            单条评论（含回复）渲染在 @/components/CommentItem.vue。
  审核：后端有 auditStatus 字段与 /api/admin/comments 接口，现在默认「发完即显示」，
        打开 server/.env 的 COMMENT_AUDIT=true 后新评论会先进入待审。
-->
<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { createComment, deleteComment, listComments } from '@/api/comments'
import CommentItem from '@/components/CommentItem.vue'
import { useUserStore } from '@/stores/user'
import forumBg from '@/assets/img/深圳湾骑车壁纸图.jpg'
import '@/assets/legacy/论坛.css'

const store = useUserStore()
const { t } = useI18n()

const comments = ref([])

/*
 * 分区：维修讨论区 / 骑行讨论区
 * 用评论的 targetId 区分（repair / riding）。
 * 旧数据 targetId 都是 'default'，统一归到「骑行讨论区」，避免历史发言消失。
 */
const CATEGORIES = [
  { key: 'repair', labelKey: 'forum.catRepair', descKey: 'forum.catRepairDesc' },
  { key: 'riding', labelKey: 'forum.catRiding', descKey: 'forum.catRidingDesc' }
]
const activeCategory = ref('repair')

function categoryOf(comment) {
  return comment.targetId === 'repair' ? 'repair' : 'riding'
}

const categoryCount = computed(() => ({
  repair: comments.value.filter((item) => categoryOf(item) === 'repair').length,
  riding: comments.value.filter((item) => categoryOf(item) === 'riding').length
}))

const visibleComments = computed(() =>
  comments.value.filter((item) => categoryOf(item) === activeCategory.value)
)

const activeCategoryMeta = computed(
  () => CATEGORIES.find((item) => item.key === activeCategory.value) || CATEGORIES[0]
)
const loading = ref(true)
const error = ref('')
const formOpen = ref(false)
const content = ref('')
const submitting = ref(false)
const notice = ref('')
const preview = ref('')

// 媒体选择
const MAX_IMAGES = 9
const MAX_VIDEO_MB = 50
const MAX_VIDEO_SECONDS = 60
const images = ref([]) // [{ file, url }]
const video = ref(null) // { file, url, duration }
const imageInput = ref(null)
const videoInput = ref(null)

// 楼中楼：正在回复哪条
const replyTarget = ref(null)

let noticeTimer
function flash(message) {
  notice.value = message
  clearTimeout(noticeTimer)
  noticeTimer = setTimeout(() => {
    notice.value = ''
  }, 2600)
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    comments.value = await listComments()
  } catch (err) {
    // 后端没启动时不要让页面白屏：把状态显示出来，其余交互照常
    error.value = err.friendlyMessage || '评论加载失败'
  } finally {
    loading.value = false
  }
}

function toggleForm() {
  if (!store.isLoggedIn) {
    flash('请先登录后再发表评论')
    return
  }
  formOpen.value = !formOpen.value
}

/* ── 图片：最多 9 张，追加选择；重复选同一张不会重复添加 ── */
function onImages(event) {
  const picked = Array.from(event.target.files || [])
  if (!picked.length) return

  const room = MAX_IMAGES - images.value.length
  if (room <= 0) {
    flash(`图片最多 ${MAX_IMAGES} 张`)
    event.target.value = ''
    return
  }

  const accepted = []
  for (const file of picked.slice(0, room)) {
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      flash(`「${file.name}」不是支持的图片格式`)
      continue
    }
    if (file.size > 20 * 1024 * 1024) {
      flash(`「${file.name}」超过 20MB`)
      continue
    }
    accepted.push({ file, url: URL.createObjectURL(file) })
  }

  images.value = [...images.value, ...accepted]
  if (picked.length > room) flash(`最多 ${MAX_IMAGES} 张，已截取前 ${room} 张`)
  event.target.value = ''
}

function removeImage(index) {
  const [removed] = images.value.splice(index, 1)
  if (removed?.url) URL.revokeObjectURL(removed.url)
}

/* ── 视频：只允许 1 个；校验类型 / 大小 / 时长 ── */
async function onVideo(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return

  if (!['video/mp4', 'video/webm', 'video/quicktime'].includes(file.type)) {
    flash('视频只支持 MP4 / WEBM / MOV')
    return
  }
  if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
    flash(`视频不能超过 ${MAX_VIDEO_MB}MB（当前 ${(file.size / 1024 / 1024).toFixed(1)}MB）`)
    return
  }

  // 读一下时长，超过 60 秒提示（仍允许上传，只是提醒别太大）
  const url = URL.createObjectURL(file)
  const duration = await new Promise((resolve) => {
    const el = document.createElement('video')
    el.preload = 'metadata'
    el.onloadedmetadata = () => resolve(el.duration || 0)
    el.onerror = () => resolve(0)
    el.src = url
  })

  if (video.value?.url) URL.revokeObjectURL(video.value.url)
  video.value = { file, url, duration }
  if (duration > MAX_VIDEO_SECONDS) {
    flash(`视频约 ${Math.round(duration)} 秒，建议控制在 ${MAX_VIDEO_SECONDS} 秒内`)
  }
}

function removeVideo() {
  if (video.value?.url) URL.revokeObjectURL(video.value.url)
  video.value = null
}

/* ── 回复 ── */
function startReply(comment) {
  if (!store.isLoggedIn) {
    flash('请先登录后再回复')
    return
  }
  replyTarget.value = comment
  formOpen.value = true
  // 聚焦到底部输入框
  requestAnimationFrame(() => {
    document.querySelector('.commentInput')?.focus()
  })
}

function cancelReply() {
  replyTarget.value = null
}

async function submit() {
  const text = content.value.trim()
  if (!text && images.value.length === 0 && !video.value) {
    flash('请输入内容，或选择图片 / 视频')
    return
  }

  submitting.value = true
  try {
    const result = await createComment({
      content: text,
      // 分区靠 targetId 区分，发到哪个区就带哪个 id
      targetId: activeCategory.value,
      parentId: replyTarget.value?.id,
      images: images.value.map((item) => item.file),
      video: video.value?.file
    })

    // 清空输入
    content.value = ''
    images.value.forEach((item) => URL.revokeObjectURL(item.url))
    images.value = []
    removeVideo()
    replyTarget.value = null
    formOpen.value = false
    if (imageInput.value) imageInput.value.value = ''
    if (videoInput.value) videoInput.value.value = ''

    await load()
    flash(result.pendingAudit ? '已提交，等待管理员审核后显示' : '发表成功')
  } catch (err) {
    flash(err.friendlyMessage || '发表失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

async function remove(id) {
  if (!window.confirm('确定要删除这条评论吗？它下面的回复也会一起删除。')) return
  try {
    await deleteComment(id)
    await load()
    flash('删除成功')
  } catch (err) {
    flash(err.friendlyMessage || '删除失败')
  }
}

const loggedInTip = computed(() =>
  store.isLoggedIn ? t('forum.loggedIn', { name: store.displayName }) : t('forum.guest')
)

const totalCount = computed(() =>
  visibleComments.value.reduce((sum, item) => sum + 1 + (item.replies?.length || 0), 0)
)

onMounted(load)
</script>

<template>
  <main class="page-forum" :style="{ backgroundImage: `url(${forumBg})` }">
    <section class="forum-shell">
      <header class="forum-head">
        <div class="head-main">
          <h1>{{ t('forum.title') }}</h1>
          <span class="login-tip">{{ loggedInTip }}</span>
        </div>
        <span class="count-tip">{{ t('forum.total', { n: totalCount }) }}</span>
      </header>

      <!-- 分区：维修讨论区 / 骑行讨论区 -->
      <nav class="cat-tabs">
        <button
          v-for="cat in CATEGORIES"
          :key="cat.key"
          type="button"
          class="cat-tab"
          :class="{ active: activeCategory === cat.key }"
          @click="activeCategory = cat.key"
        >
          {{ t(cat.labelKey) }}
          <span class="cat-count">{{ categoryCount[cat.key] }}</span>
        </button>
      </nav>
      <p class="cat-desc">{{ t(activeCategoryMeta.descKey) }}</p>

      <div class="comments-section">
        <div class="commentsContainer">
          <p v-if="loading" class="state">{{ t('common.loading') }}</p>
          <p v-else-if="error" class="state state-error">{{ error }}</p>
          <p v-else-if="!visibleComments.length" class="state">{{ t('forum.empty') }}</p>

          <template v-else>
            <CommentItem
              v-for="item in visibleComments"
              :key="item.id"
              :comment="item"
              :current-user-id="store.userId"
              :can-reply="store.isLoggedIn"
              @delete="remove"
              @preview="preview = $event"
              @reply="startReply"
            />
          </template>
        </div>
      </div>
    </section>

    <!-- 底部发评论条：外层铺满宽度做背景，内层限宽居中，避免页脚文字从两侧露出来 -->
    <div class="comment-bar">
      <div class="comment-bar-inner">
        <form class="commentForm" @submit.prevent="submit">
        <!-- 回复提示 -->
        <div v-if="replyTarget" class="reply-banner">
          <span>{{ t('forum.replying') }} <b>@{{ replyTarget.User?.username }}</b>：{{ (replyTarget.content || 'media').slice(0, 20) }}</span>
          <button type="button" class="link-btn" @click="cancelReply">{{ t('forum.cancelReply') }}</button>
        </div>

        <textarea
          v-model="content"
          class="commentInput"
          :placeholder="replyTarget ? t('forum.replyPlaceholder', { name: replyTarget.User?.username }) : t('forum.placeholder')"
          maxlength="1000"
        />

        <!-- 已选媒体预览 -->
        <div v-if="images.length || video" class="media-preview">
          <div v-for="(item, index) in images" :key="index" class="thumb">
            <img :src="item.url" alt="待上传图片" />
            <button type="button" class="thumb-remove" @click="removeImage(index)">×</button>
          </div>

          <div v-if="video" class="thumb video-thumb">
            <video :src="video.url" muted preload="metadata" />
            <button type="button" class="thumb-remove" @click="removeVideo">×</button>
            <span class="video-badge">
              {{ video.duration ? `${Math.round(video.duration)}s` : '视频' }}
            </span>
          </div>
        </div>

        <div class="form-tools">
          <label class="tool-btn" :class="{ disabled: images.length >= MAX_IMAGES }">
            {{ t('forum.images', { n: images.length, max: MAX_IMAGES }) }}
            <input
              ref="imageInput"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              :disabled="images.length >= MAX_IMAGES"
              @change="onImages"
            />
          </label>

          <label class="tool-btn" :class="{ disabled: Boolean(video) }">
            {{ video ? t('forum.videoPicked') : t('forum.video', { size: MAX_VIDEO_MB }) }}
            <input
              ref="videoInput"
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              :disabled="Boolean(video)"
              @change="onVideo"
            />
          </label>

          <span class="hint">{{ t('forum.hint') }}</span>

          <button type="submit" class="submitButton" :disabled="submitting">
            {{ submitting ? t('common.loading') : replyTarget ? t('forum.reply') : t('forum.submit') }}
          </button>
        </div>
      </form>
      </div>
    </div>

    <transition name="toast">
      <p v-if="notice" class="toast">{{ notice }}</p>
    </transition>

    <div v-if="preview" class="modal" :style="{ display: 'block' }" @click.self="preview = ''">
      <span class="close" @click="preview = ''">&times;</span>
      <div class="modal-content">
        <img :src="preview" alt="评论图片" />
      </div>
    </div>
  </main>
</template>

<style scoped>
.page-forum {
  min-height: 100vh;
  padding: 96px 0 280px;
  /* 主背景：骑行照片 + 暖色渐变遮罩，保证和站点主题一致 */
  background-position: center top;
  background-size: cover;
  background-attachment: fixed;
  background-repeat: no-repeat;
  position: relative;
}

/* 遮罩层：让照片不至于抢文字的对比度 */
.page-forum::before {
  content: '';
  position: fixed;
  inset: 0;
  background: linear-gradient(180deg, rgba(250, 245, 235, 0.72) 0%, rgba(246, 231, 210, 0.86) 100%);
  pointer-events: none;
  z-index: 0;
}

.forum-shell {
  /* PC 自适应：原来是 80%，在 2560 屏上会变成 2000px 宽，一屏只有一两行字 */
  position: relative;
  z-index: 1;
  width: min(1100px, 92vw);
  min-height: 560px;
  margin: 0 auto;
  padding: 20px 24px 36px;
  border-radius: 16px;
  /* 半透明主题色卡片 + 磨砂，底下的照片会透上来一点点 */
  background: rgba(255, 250, 243, 0.82);
  backdrop-filter: blur(10px) saturate(1.1);
  -webkit-backdrop-filter: blur(10px) saturate(1.1);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 18px 40px rgba(120, 90, 50, 0.16);
}

.forum-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px 16px;
}

.head-main {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 14px;
}

.forum-head h1 {
  margin: 8px 0 16px;
}

.login-tip,
.count-tip {
  color: #7a6248;
  font-size: 14px;
}

/* 原 CSS 里 .commentsContainer 有 left:-200px / width:70%，是用来抵消旧布局的，
   SPA 里容器结构变了，这里归零 */
/* 分区标签（维修讨论区 / 骑行讨论区） */
.cat-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 8px 0 4px;
}

.cat-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 20px;
  border: 1px solid rgba(232, 201, 166, 0.9);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  color: #7a6248;
  font-family: inherit;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.cat-tab:hover {
  background: rgba(255, 245, 232, 0.95);
}

.cat-tab.active {
  border-color: #e8863c;
  background: #e8863c;
  color: #fff;
  box-shadow: 0 6px 16px rgba(232, 134, 60, 0.28);
}

.cat-count {
  padding: 1px 8px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.08);
  font-size: 12px;
}

.cat-tab.active .cat-count {
  background: rgba(255, 255, 255, 0.28);
}

.cat-desc {
  margin: 0 0 14px;
  color: #8a7761;
  font-size: 13px;
  line-height: 1.7;
}

.commentsContainer {
  left: 0;
  width: 100%;
  box-sizing: border-box;
}

.state {
  margin: 0;
  padding: 24px 0;
  color: #666;
  text-align: center;
}

.state-error {
  color: #c0392b;
  line-height: 1.7;
}

/* 原来 .commentForm 是 display:none + JS 改 style.display，这里交给 v-if */
.commentForm {
  display: block;
}

/* 回复提示条 */
.reply-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
  padding: 6px 12px;
  border-radius: 6px;
  background: #fff4e4;
  border-left: 3px solid #e8863c;
  color: #6b5a45;
  font-size: 13px;
}

.link-btn {
  padding: 0;
  border: 0;
  background: transparent;
  color: #c45d16;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

/* 已选媒体缩略图 */
.media-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.thumb {
  position: relative;
  width: 72px;
  height: 72px;
  border-radius: 6px;
  overflow: hidden;
  background: #f3ede3;
}

.thumb img,
.thumb video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.thumb-remove {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 20px;
  height: 20px;
  border: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 14px;
  line-height: 18px;
  cursor: pointer;
}

.video-badge {
  position: absolute;
  left: 2px;
  bottom: 2px;
  padding: 1px 5px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 10px;
}

/* 工具行 */
.form-tools {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 8px;
}

.tool-btn {
  position: relative;
  display: inline-block;
  padding: 6px 14px;
  border: 1px solid #e8c9a6;
  border-radius: 999px;
  background: #fffdf9;
  color: #b96a26;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  overflow: hidden;
}

.tool-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tool-btn input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.hint {
  color: #8a7761;
  font-size: 12px;
}

/* 提交按钮靠右 */
.form-tools .submitButton {
  margin-left: auto;
}

.toast {
  position: fixed;
  bottom: 150px;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  padding: 10px 22px;
  border-radius: 999px;
  background: rgba(40, 40, 40, 0.88);
  color: #fff;
  font-size: 14px;
  z-index: 100000;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 8px);
}

/* ============================================================
   底部发评论条
   旧样式是 width:50% + left:25% 的浮动条；这里改成「整宽背景 + 内层限宽」，
   这样页脚文字不会从浮动条两侧露出来，滚动时也始终压在页面最上面。
   ============================================================ */
/* 底部评论条：浮动小卡片，不再是一条通栏色带（之前收起时也很占地方） */
.comment-bar {
  position: fixed;
  left: 50%;
  bottom: 18px;
  transform: translateX(-50%);
  width: min(760px, 94vw);
  box-sizing: border-box;
  background: transparent;
  z-index: 60;
  pointer-events: none;
}

.comment-bar-inner {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  max-height: 62vh;
  overflow-y: auto;
  pointer-events: auto;
  /* 收起时只有一颗按钮，展开时卡片自然变高 */
  background: transparent;
  padding: 0;
}

/* 「添加评论 / 收起」按钮：旧样式是 width:100%，展开时整条变红，太抢眼；
   改成右侧的小胶囊按钮，绿色=添加、红色=收起（保留旧站的颜色语义） */
/* 展开后的输入卡片：半透明白 + 磨砂，浮在照片上 */
.comment-bar .commentForm {
  width: 100%;
  box-sizing: border-box;
  padding: 12px;
  background: rgba(255, 253, 249, 0.96);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 14px 34px rgba(80, 60, 40, 0.22);
}

.comment-bar .toggleCommentButton {
  width: auto;
  min-width: 108px;
  align-self: flex-end;
  margin-left: auto;
  padding: 8px 18px;
  border-radius: 999px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(40, 120, 60, 0.18);
}

.comment-bar .toggleCommentButton.active {
  box-shadow: 0 2px 8px rgba(200, 40, 40, 0.18);
}

/* 展开后的表单卡片 */
.comment-bar .commentForm {
  margin-top: 10px;
  padding: 12px;
  border-radius: 10px;
  background: #fffdf9;
  border: 1px solid #efe2cd;
}

.comment-bar .commentInput {
  min-height: 64px;
  border: 1px solid #e2d6c4;
  border-radius: 8px;
  background: #fff;
  font-family: inherit;
  font-size: 15px;
  color: #33261a;
  resize: vertical;
}

.comment-bar .commentInput:focus {
  outline: none;
  border-color: #e8863c;
  box-shadow: 0 0 0 3px rgba(232, 134, 60, 0.15);
}

/* 提交按钮：旧 CSS 是 float:right，会把工具行挤乱；这里用 flex 靠右 */
.comment-bar .form-tools .submitButton {
  float: none;
  margin-left: auto;
  padding: 8px 22px;
  border-radius: 999px;
  background: #e8863c;
  color: #fff;
  font-family: inherit;
  font-weight: 700;
  border: 0;
  cursor: pointer;
}

.comment-bar .form-tools .submitButton:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 评论里的长链接/长英文不要撑破卡片 */
.commentsContainer :deep(.comment-content p) {
  overflow-wrap: anywhere;
}
</style>
