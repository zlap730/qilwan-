<!--
  AdminReviewView.vue —— 后台「评论审核」
  路由：/admin/review（需要管理员）

  用途：只看待审评论，逐条「通过 / 驳回」。
  说明：现在站点的 `COMMENT_AUDIT=false`，新评论默认直接通过，
        所以这里通常为空；打开 server/.env 的 COMMENT_AUDIT=true 后，
        新评论会以 pending 状态进到这里。

  功能：统计卡、列表（含图片/视频预览）、通过、驳回（可填原因）。
  对应接口：GET /api/admin/comments?status=pending、PATCH /api/admin/comments/:id/review
-->
<script setup>
import { onMounted, ref } from 'vue'

import { adminList, adminReview, adminStats } from '@/api/admin'
import { formatTime, resolveAssetUrl } from '@/utils/asset'
import '@/assets/admin.css'

const stats = ref({ pending: 0, approved: 0, rejected: 0, hidden: 0 })
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = 10
const pages = ref(1)
const loading = ref(false)
const error = ref('')
const notice = ref('')

// 当前展开「驳回原因」的那条评论 id
const rejectingId = ref(null)
const rejectNote = ref('')

async function loadStats() {
  try {
    stats.value = await adminStats()
  } catch (err) {
    error.value = err.friendlyMessage || '统计读取失败'
  }
}

async function loadList() {
  loading.value = true
  error.value = ''
  try {
    const data = await adminList({ status: 'pending', page: page.value })
    list.value = data.items
    total.value = data.total
    pages.value = Math.max(Math.ceil(data.total / data.pageSize), 1)
  } catch (err) {
    error.value = err.friendlyMessage || '待审评论读取失败'
  } finally {
    loading.value = false
  }
}

async function review(comment, auditStatus, note = '') {
  try {
    await adminReview(comment.id, auditStatus, note)
    notice.value = auditStatus === 'approved' ? '已通过' : '已驳回'
    rejectingId.value = null
    rejectNote.value = ''
    await Promise.all([loadList(), loadStats()])
  } catch (err) {
    error.value = err.friendlyMessage || '审核失败'
  }
}

function startReject(comment) {
  rejectingId.value = comment.id
  rejectNote.value = ''
}

function confirmReject(comment) {
  review(comment, 'rejected', rejectNote.value.trim())
}

function go(next) {
  if (next < 1 || next > pages.value) return
  page.value = next
  loadList()
}

onMounted(() => {
  loadStats()
  loadList()
})
</script>

<template>
  <div>
    <div class="a-stats">
      <div class="a-stat warn">
        <div class="a-stat-value">{{ stats.pending }}</div>
        <div class="a-stat-label">待审核</div>
      </div>
      <div class="a-stat accent">
        <div class="a-stat-value">{{ stats.approved }}</div>
        <div class="a-stat-label">已通过</div>
      </div>
      <div class="a-stat danger">
        <div class="a-stat-value">{{ stats.rejected }}</div>
        <div class="a-stat-label">已驳回</div>
      </div>
      <div class="a-stat">
        <div class="a-stat-value">{{ stats.hidden }}</div>
        <div class="a-stat-label">已隐藏</div>
      </div>
    </div>

    <div class="a-card">
      <div class="a-toolbar">
        <strong style="font-size: 15px">待审核评论</strong>
        <span style="color: #8a97a8; font-size: 13px">共 {{ total }} 条</span>
        <button type="button" class="a-btn a-btn-ghost a-btn-sm" style="margin-left: auto" @click="loadList">
          刷新
        </button>
      </div>

      <p v-if="error" class="a-msg a-msg-error">{{ error }}</p>
      <p v-else-if="notice" class="a-msg a-msg-ok">{{ notice }}</p>

      <p v-if="loading" class="a-empty">加载中…</p>
      <p v-else-if="!list.length" class="a-empty">
        没有待审核的评论。若希望新评论「先审后发」，把 server/.env 里的
        <code>COMMENT_AUDIT</code> 改成 <code>true</code> 并重启后端。
      </p>

      <article v-for="item in list" v-else :key="item.id" class="review-item">
        <header class="review-head">
          <img class="a-avatar" :src="resolveAssetUrl(item.author?.avatar)" alt="" />
          <strong>{{ item.author?.username }}</strong>
          <span class="muted">{{ formatTime(item.created_at) }}</span>
          <span v-if="item.parentId" class="a-tag a-tag-gray">回复</span>
          <span class="a-tag a-tag-orange" style="margin-left: auto">待审核</span>
        </header>

        <p class="review-text">{{ item.content || '（只有图片/视频）' }}</p>

        <div v-if="item.media?.length" class="review-media">
          <template v-for="media in item.media" :key="media.id">
            <video v-if="media.type === 'video'" :src="resolveAssetUrl(media.url)" controls preload="metadata" />
            <img v-else :src="resolveAssetUrl(media.url)" alt="评论图片" @click="window.open(resolveAssetUrl(media.url))" />
          </template>
        </div>

        <div v-if="rejectingId === item.id" class="reject-box">
          <input
            v-model="rejectNote"
            class="a-input"
            type="text"
            placeholder="驳回原因（可选，会记录在 reviewNote）"
            style="width: 100%"
          />
          <div class="a-ops" style="margin-top: 8px">
            <button type="button" class="a-btn a-btn-danger a-btn-sm" @click="confirmReject(item)">确认驳回</button>
            <button type="button" class="a-btn a-btn-ghost a-btn-sm" @click="rejectingId = null">取消</button>
          </div>
        </div>

        <div v-else class="a-ops">
          <button type="button" class="a-btn a-btn-primary a-btn-sm" @click="review(item, 'approved')">
            通过
          </button>
          <button type="button" class="a-btn a-btn-danger a-btn-sm" @click="startReject(item)">驳回</button>
        </div>
      </article>

      <div v-if="pages > 1" class="a-pager">
        <span>第 {{ page }} / {{ pages }} 页</span>
        <button type="button" :disabled="page <= 1" @click="go(page - 1)">上一页</button>
        <button type="button" :disabled="page >= pages" @click="go(page + 1)">下一页</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.review-item {
  padding: 14px 0;
  border-bottom: 1px solid #f0f0f0;
}

.review-item:last-of-type {
  border-bottom: 0;
}

.review-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
}

.review-head .muted {
  color: #8a97a8;
  font-size: 12px;
}

.review-text {
  margin: 0 0 10px;
  color: #333;
  font-size: 14px;
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-word;
}

.review-media {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.review-media img,
.review-media video {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
  background: #f5f5f5;
  cursor: pointer;
}

.reject-box {
  margin-top: 6px;
}
</style>
