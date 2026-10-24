<!--
  AdminCommentsView.vue —— 后台「评论管理」
  路由：/admin/comments（需要管理员）

  和「评论审核」的区别：
    · 这里看**所有**评论（有效 + 已删除 + 各种审核状态），用来做日常管理；
    · 审核页只看待审的，用来做通过/驳回。

  功能：按状态筛选、关键字搜索、查看媒体、隐藏（软删除）。
  对应接口：GET /api/admin/comments、POST /api/admin/comments/:id/hide
-->
<script setup>
import { onMounted, ref } from 'vue'

import { adminHide, adminList } from '@/api/admin'
import { formatTime, resolveAssetUrl } from '@/utils/asset'
import '@/assets/admin.css'

const STATUS_TABS = [
  { key: 'all', label: '全部' },
  { key: 'approved', label: '已通过' },
  { key: 'pending', label: '待审核' },
  { key: 'rejected', label: '已驳回' }
]

const status = ref('all')
const keyword = ref('')
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = 10
const pages = ref(1)
const loading = ref(false)
const error = ref('')
const notice = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await adminList({ status: status.value, page: page.value, keyword: keyword.value.trim() })
    list.value = data.items
    total.value = data.total
    pages.value = Math.max(Math.ceil(data.total / data.pageSize), 1)
  } catch (err) {
    error.value = err.friendlyMessage || '评论列表读取失败'
  } finally {
    loading.value = false
  }
}

function switchStatus(key) {
  status.value = key
  page.value = 1
  load()
}

function search() {
  page.value = 1
  load()
}

function go(next) {
  if (next < 1 || next > pages.value) return
  page.value = next
  load()
}

async function hide(comment) {
  if (!window.confirm('隐藏这条评论？它和它下面的回复都会从讨论区消失（数据仍保留）。')) return
  try {
    const data = await adminHide(comment.id)
    notice.value = `已隐藏 ${data.hidden} 条`
    await load()
  } catch (err) {
    error.value = err.friendlyMessage || '隐藏失败'
  }
}

const statusText = { active: '有效', deleted: '已删除' }
const auditText = { pending: '待审核', approved: '已通过', rejected: '已驳回' }
const auditClass = { pending: 'a-tag-orange', approved: 'a-tag-green', rejected: 'a-tag-red' }

onMounted(load)
</script>

<template>
  <div class="a-card">
    <div class="a-toolbar">
      <button
        v-for="tab in STATUS_TABS"
        :key="tab.key"
        type="button"
        class="a-btn"
        :class="status === tab.key ? 'a-btn-primary' : 'a-btn-ghost'"
        @click="switchStatus(tab.key)"
      >
        {{ tab.label }}
      </button>

      <input
        v-model="keyword"
        class="a-input"
        type="text"
        placeholder="搜索评论内容"
        style="margin-left: 8px"
        @keyup.enter="search"
      />
      <button type="button" class="a-btn a-btn-primary" :disabled="loading" @click="search">查询</button>

      <span style="margin-left: auto; color: #8a97a8; font-size: 13px">共 {{ total }} 条</span>
    </div>

    <p v-if="error" class="a-msg a-msg-error">{{ error }}</p>
    <p v-else-if="notice" class="a-msg a-msg-ok">{{ notice }}</p>

    <div class="a-table-wrap">
      <table class="a-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>内容</th>
            <th>作者</th>
            <th>媒体</th>
            <th>状态</th>
            <th>审核</th>
            <th>时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="8" class="a-empty">加载中…</td>
          </tr>
          <tr v-else-if="!list.length">
            <td colspan="8" class="a-empty">没有匹配的评论</td>
          </tr>
          <tr v-for="item in list" v-else :key="item.id">
            <td>{{ item.id }}</td>
            <td class="ellipsis" :title="item.content">
              {{ item.content || '（只有图片/视频）' }}
              <span v-if="item.parentId" class="a-tag a-tag-gray" style="margin-left: 6px">回复</span>
            </td>
            <td class="nowrap">
              <img class="a-avatar" :src="resolveAssetUrl(item.author?.avatar)" alt="" />
              {{ item.author?.username }}
            </td>
            <td class="nowrap">
              <a
                v-for="media in item.media"
                :key="media.id"
                :href="resolveAssetUrl(media.url)"
                target="_blank"
                rel="noreferrer"
                class="a-tag a-tag-blue"
                style="margin-right: 4px; text-decoration: none"
              >
                {{ media.type === 'video' ? '视频' : '图片' }}
              </a>
              <span v-if="!item.media?.length" class="muted">—</span>
            </td>
            <td>
              <span class="a-tag" :class="item.status === 'active' ? 'a-tag-green' : 'a-tag-gray'">
                {{ statusText[item.status] || item.status }}
              </span>
            </td>
            <td>
              <span class="a-tag" :class="auditClass[item.auditStatus]">
                {{ auditText[item.auditStatus] }}
              </span>
            </td>
            <td class="nowrap muted">{{ formatTime(item.created_at) }}</td>
            <td>
              <div class="a-ops">
                <button
                  type="button"
                  class="a-btn a-btn-sm a-btn-warn"
                  :disabled="item.status !== 'active'"
                  @click="hide(item)"
                >
                  隐藏
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="a-pager">
      <span>第 {{ page }} / {{ pages }} 页</span>
      <button type="button" :disabled="page <= 1" @click="go(page - 1)">上一页</button>
      <button type="button" :disabled="page >= pages" @click="go(page + 1)">下一页</button>
    </div>
  </div>
</template>
