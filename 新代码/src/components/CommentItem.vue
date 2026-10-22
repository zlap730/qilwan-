<script setup>
import { computed } from 'vue'

import placeholder from '@/assets/img/图标文件/占位.png'
import { formatTime, resolveAssetUrl } from '@/utils/asset'

const props = defineProps({
  comment: { type: Object, required: true },
  canDelete: { type: Boolean, default: false }
})

const emit = defineEmits(['delete', 'preview'])

const author = computed(() => props.comment.User || {})
const username = computed(() => author.value.username || '未知用户')
const avatar = computed(() => resolveAssetUrl(author.value.avatar))

// 原逻辑：有 comment.image 就只显示它，否则回落到 CommentImages 数组
const images = computed(() => {
  const { comment } = props
  if (comment.image) return [resolveAssetUrl(comment.image)]

  return (comment.CommentImages || [])
    .map((item) => resolveAssetUrl(item.imageUrl || item.image_url))
    .filter(Boolean)
})

const time = computed(() => formatTime(props.comment.created_at || props.comment.createdAt))

function onImageError(event) {
  event.target.src = placeholder
}
</script>

<template>
  <article class="comment">
    <div class="comment-header">
      <img v-if="author.avatar" class="comment-avatar" :src="avatar" :alt="username" @error="onImageError" />
      <div v-else class="comment-avatar-fallback">{{ username.slice(0, 1) }}</div>

      <div class="comment-user-info">
        <span class="comment-username">{{ username }}</span>
        <span class="comment-time">{{ time }}</span>
      </div>
    </div>

    <!-- 原实现用 commentElement.innerHTML = `...${comment.content}...`，用户输入会被当 HTML 执行；
         这里用 {{ }} 插值，Vue 自动转义，XSS 问题从根上没了 -->
    <div class="comment-content">
      <p v-if="comment.content">{{ comment.content }}</p>
      <img
        v-for="src in images"
        :key="src"
        class="comment-image"
        :src="src"
        alt="评论图片"
        @error="onImageError"
        @click="emit('preview', src)"
      />
    </div>

    <button v-if="canDelete" type="button" class="deleteButton" @click="emit('delete', comment.id)">
      删除
    </button>
  </article>
</template>

<style scoped>
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

.comment-content .comment-image {
  width: 120px;
  margin-right: 8px;
  border-radius: 5px;
  cursor: zoom-in;
}
</style>
