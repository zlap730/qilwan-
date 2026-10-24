<!--
  CommentItem.vue —— 单条评论（支持楼中楼、多图、视频）

  被 ForumView.vue 使用，并且**递归**引用自己来渲染回复：
    <CommentItem :comment="reply" :depth="depth + 1" ... />
  递归组件在 <script setup> 里可以直接用文件名当组件名，不需要额外注册。

  显示内容：
    · 头像 / 用户名 / 时间 / 回复对象（回复 @xxx）
    · 正文（插值，Vue 自动转义，不会有旧代码那种 XSS）
    · 图片最多 9 张，九宫格排版；视频用 <video controls> 播
    · 操作：回复（登录后可见）、删除（自己的评论）、图片点击放大
-->
<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import placeholder from '@/assets/img/图标文件/占位.png'
import { formatTime, resolveAssetUrl } from '@/utils/asset'

const props = defineProps({
  comment: { type: Object, required: true },
  // 当前登录用户 id（用于判断能不能删）——递归时直接传下去，避免每层再算权限
  currentUserId: { type: [Number, String], default: null },
  canReply: { type: Boolean, default: false },
  depth: { type: Number, default: 0 }
})

const emit = defineEmits(['delete', 'preview', 'reply'])

const { t } = useI18n()

const MAX_DEPTH = 2 // 最多展示两层，更深的回复统一挂到第二层（显示 @某人）

const author = computed(() => props.comment.User || {})
const username = computed(() => author.value.username || '未知用户')
const avatar = computed(() => resolveAssetUrl(author.value.avatar))

// 媒体：优先用新的 CommentImages（含 type），兼容旧的 comment.image
const media = computed(() => {
  const { comment } = props
  if (comment.CommentImages?.length) {
    return comment.CommentImages.map((item) => ({
      url: resolveAssetUrl(item.url || item.imageUrl || item.image_url),
      type: item.type || item.mediaType || 'image'
    })).filter((item) => item.url)
  }
  if (comment.image) return [{ url: resolveAssetUrl(comment.image), type: 'image' }]
  return []
})

const images = computed(() => media.value.filter((item) => item.type === 'image'))
const videos = computed(() => media.value.filter((item) => item.type === 'video'))

const replies = computed(() => props.comment.replies || [])
const time = computed(() => formatTime(props.comment.created_at || props.comment.createdAt))
const replyTo = computed(() => props.comment.replyTo?.username || '')

// 能不能删：登录了 + 是自己发的
const canDelete = computed(
  () =>
    Boolean(props.currentUserId) &&
    Number(props.comment.User?.id ?? props.comment.authorId) === Number(props.currentUserId)
)

function onImageError(event) {
  event.target.src = placeholder
}
</script>

<template>
  <article class="comment" :class="{ 'is-reply': depth > 0 }">
    <div class="comment-header">
      <img v-if="author.avatar" class="comment-avatar" :src="avatar" :alt="username" @error="onImageError" />
      <div v-else class="comment-avatar-fallback">{{ username.slice(0, 1) }}</div>

      <div class="comment-user-info">
        <span class="comment-username">
          {{ username }}
          <span v-if="replyTo" class="reply-target">{{ t('forum.replyTo', { name: replyTo }) }}</span>
        </span>
        <span class="comment-time">{{ time }}</span>
      </div>
    </div>

    <!-- 正文：插值渲染，用户输入不会被当 HTML 执行 -->
    <div class="comment-content">
      <p v-if="comment.content">{{ comment.content }}</p>

      <!-- 图片：1 张独占一行，多张九宫格 -->
      <div v-if="images.length" class="media-grid" :class="`count-${Math.min(images.length, 9)}`">
        <img
          v-for="(item, index) in images"
          :key="index"
          class="comment-image"
          :src="item.url"
          alt="评论图片"
          loading="lazy"
          @error="onImageError"
          @click="emit('preview', item.url)"
        />
      </div>

      <!-- 视频：最多 1 个，点播放前不加载 -->
      <div v-if="videos.length" class="video-wrap">
        <video
          v-for="(item, index) in videos"
          :key="index"
          :src="item.url"
          controls
          preload="metadata"
          playsinline
        />
      </div>
    </div>

    <div class="comment-actions">
      <button v-if="canReply && depth < MAX_DEPTH" type="button" class="replyButton" @click="emit('reply', comment)">
        {{ t('forum.replyAction') }}
      </button>
      <button v-if="canDelete" type="button" class="deleteButton" @click="emit('delete', comment.id)">
        {{ t('common.delete') }}
      </button>    </div>

    <!-- 递归渲染回复 -->
    <div v-if="replies.length" class="reply-list">
      <CommentItem
        v-for="reply in replies"
        :key="reply.id"
        :comment="reply"
        :current-user-id="currentUserId"
        :can-reply="canReply"
        :depth="depth + 1"
        @delete="emit('delete', $event)"
        @preview="emit('preview', $event)"
        @reply="emit('reply', $event)"
      />
    </div>
  </article>
</template>

<style scoped>
.comment {
  padding: 14px 16px;
  margin-bottom: 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.82);
}

.comment.is-reply {
  margin: 10px 0 0;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.92);
  border-left: 3px solid #f0c48c;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.comment-avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #007bff;
  color: #fff;
  font-weight: 700;
}

.comment-user-info {
  display: flex;
  flex-direction: column;
}

.comment-username {
  color: #333;
  font-weight: 700;
}

.reply-target {
  margin-left: 6px;
  color: #c47a2c;
  font-size: 12px;
  font-weight: 700;
}

.comment-time {
  color: #999;
  font-size: 12px;
}

.comment-content p {
  margin: 0 0 6px;
  color: #333;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 图片九宫格：1 张给大图，2~9 张均分 */
.media-grid {
  display: grid;
  gap: 6px;
  margin: 8px 0 4px;
  max-width: 520px;
}

.media-grid.count-1 {
  grid-template-columns: minmax(0, 1fr);
  max-width: 360px;
}

.media-grid.count-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.media-grid.count-3,
.media-grid.count-4,
.media-grid.count-5,
.media-grid.count-6,
.media-grid.count-7,
.media-grid.count-8,
.media-grid.count-9 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.media-grid .comment-image {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 6px;
  cursor: zoom-in;
  background: #f3ede3;
}

.media-grid.count-1 .comment-image {
  aspect-ratio: auto;
  max-height: 320px;
  object-fit: contain;
}

.video-wrap {
  margin: 8px 0 4px;
  max-width: 480px;
}

.video-wrap video {
  width: 100%;
  max-height: 320px;
  border-radius: 8px;
  background: #000;
}

.comment-actions {
  display: flex;
  gap: 14px;
}

.replyButton,
.deleteButton {
  padding: 0;
  border: 0;
  background: transparent;
  color: #8a6a45;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.replyButton:hover {
  color: #c47a2c;
}

.deleteButton {
  color: #c0392b;
}

.reply-list {
  margin-top: 6px;
  padding-left: 12px;
}
</style>
