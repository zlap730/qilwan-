<script setup>
import { computed, onMounted, ref } from 'vue'

import { createComment, deleteComment, listComments } from '@/api/comments'
import CommentItem from '@/components/CommentItem.vue'
import { useUserStore } from '@/stores/user'
import '@/assets/legacy/论坛.css'

const store = useUserStore()

const comments = ref([])
const loading = ref(true)
const error = ref('')
const formOpen = ref(false)
const content = ref('')
const file = ref(null)
const fileInput = ref(null)
const submitting = ref(false)
const notice = ref('')
const preview = ref('')

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

function canDelete(comment) {
  const authorId = comment.User?.id ?? comment.authorId
  return Boolean(store.userId) && authorId === store.userId
}

function toggleForm() {
  if (!store.isLoggedIn) {
    flash('请先登录后再发表评论')
    return
  }
  formOpen.value = !formOpen.value
}

function onFile(event) {
  file.value = event.target.files?.[0] || null
}

async function submit() {
  const text = content.value.trim()
  if (!text && !file.value) {
    flash('请输入评论内容或选择图片')
    return
  }

  submitting.value = true
  try {
    await createComment({ content: text, image: file.value })
    content.value = ''
    file.value = null
    if (fileInput.value) fileInput.value.value = ''
    formOpen.value = false
    await load()
    flash('评论发表成功')
  } catch (err) {
    flash(err.friendlyMessage || '发表失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

async function remove(id) {
  if (!window.confirm('确定要删除这条评论吗？')) return
  try {
    await deleteComment(id)
    // 直接从本地状态移除，不用像原来那样删完再整页重新拉一次
    comments.value = comments.value.filter((item) => item.id !== id)
    flash('删除成功')
  } catch (err) {
    flash(err.friendlyMessage || '删除失败')
  }
}

const loggedInTip = computed(() =>
  store.isLoggedIn ? `当前登录：${store.displayName}` : '未登录：可以浏览，登录后可以发言'
)

onMounted(load)
</script>

<template>
  <main class="page-forum">
    <section class="forum-shell">
      <header class="forum-head">
        <h1>讨论区</h1>
        <span class="login-tip">{{ loggedInTip }}</span>
      </header>

      <div class="comments-section">
        <div class="commentsContainer">
          <p v-if="loading" class="state">评论加载中…</p>
          <p v-else-if="error" class="state state-error">{{ error }}</p>
          <p v-else-if="!comments.length" class="state">还没有人发言，来抢第一个沙发吧。</p>

          <template v-else>
            <CommentItem
              v-for="item in comments"
              :key="item.id"
              :comment="item"
              :can-delete="canDelete(item)"
              @delete="remove"
              @preview="preview = $event"
            />
          </template>
        </div>
      </div>
    </section>

    <!-- 原页面从 DOM 里查 8 个节点再逐个 addEventListener，现在靠 v-model / @submit 声明式完成 -->
    <div class="comment-bar">
      <button type="button" class="toggleCommentButton" :class="{ active: formOpen }" @click="toggleForm">
        {{ formOpen ? '收起' : '添加评论' }}
      </button>

      <form v-if="formOpen" class="commentForm" @submit.prevent="submit">
        <textarea v-model="content" class="commentInput" placeholder="在这里输入你的评论" />
        <input ref="fileInput" type="file" class="commentImageInput" accept="image/*" @change="onFile" />
        <button type="submit" class="submitButton" :disabled="submitting">
          {{ submitting ? '提交中…' : '提交' }}
        </button>
      </form>
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
  padding: 110px 0 220px;
}

.forum-shell {
  width: 80%;
  min-height: 620px;
  margin: 0 auto;
  padding: 18px 24px 40px;
  border-radius: 6px;
  background-color: rgba(255, 228, 196, 0.95);
}

.forum-head {
  display: flex;
  align-items: baseline;
  gap: 16px;
}

.forum-head h1 {
  margin: 8px 0 16px;
}

.login-tip {
  color: #7a6248;
  font-size: 14px;
}

/* 原 CSS 里 .commentsContainer 有 left:-200px / width:70%，是用来抵消旧布局的，
   SPA 里容器结构变了，这里归零 */
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

.commentImageInput {
  margin-bottom: 10px;
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
</style>
