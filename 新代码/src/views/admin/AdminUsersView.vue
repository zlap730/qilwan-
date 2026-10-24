<!--
  AdminUsersView.vue —— 后台「用户管理」
  路由：/admin/users（需要管理员）

  功能：
    · 顶部统计：用户总数 / 管理员数 / 今日新增
    · 搜索：按用户名或邮箱模糊查
    · 表格：头像、用户名、邮箱、评论数、身份、注册时间
    · 操作：设为/取消管理员、重置密码、删除用户
  对应接口：server/routes/adminUsers.js
-->
<script setup>
import { onMounted, ref } from 'vue'

import {
  adminDeleteUser,
  adminResetPassword,
  adminSetAdmin,
  adminUserList,
  adminUserStats
} from '@/api/admin'
import { formatTime, resolveAssetUrl } from '@/utils/asset'
import '@/assets/admin.css'

const stats = ref({ users: 0, admins: 0, today: 0 })
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = 10
const keyword = ref('')
const loading = ref(false)
const error = ref('')
const notice = ref('')

const pages = ref(1)

async function loadStats() {
  try {
    stats.value = await adminUserStats()
  } catch (err) {
    error.value = err.friendlyMessage || '统计读取失败'
  }
}

async function loadList() {
  loading.value = true
  error.value = ''
  try {
    const data = await adminUserList({ keyword: keyword.value.trim(), page: page.value, pageSize })
    list.value = data.items
    total.value = data.total
    pages.value = Math.max(Math.ceil(data.total / data.pageSize), 1)
  } catch (err) {
    error.value = err.friendlyMessage || '用户列表读取失败'
  } finally {
    loading.value = false
  }
}

function search() {
  page.value = 1
  loadList()
}

function go(next) {
  if (next < 1 || next > pages.value) return
  page.value = next
  loadList()
}

function flash(message) {
  notice.value = message
  setTimeout(() => {
    if (notice.value === message) notice.value = ''
  }, 2400)
}

async function toggleAdmin(user) {
  const next = !user.isAdmin
  const verb = next ? '设为管理员' : '取消管理员'
  if (!window.confirm(`确定要把「${user.username}」${verb}吗？`)) return
  try {
    const data = await adminSetAdmin(user.id, next)
    user.isAdmin = data.isAdmin
    flash(`${user.username} 已${next ? '设为管理员' : '取消管理员'}`)
    loadStats()
  } catch (err) {
    error.value = err.friendlyMessage || '操作失败'
  }
}

async function resetPassword(user) {
  const password = window.prompt(`给「${user.username}」设置新密码（至少 6 位）：`)
  if (!password) return
  if (password.length < 6) {
    error.value = '密码至少 6 位'
    return
  }
  try {
    const data = await adminResetPassword(user.id, password)
    flash(data.message || '密码已重置')
  } catch (err) {
    error.value = err.friendlyMessage || '重置失败'
  }
}

async function remove(user) {
  if (!window.confirm(`删除用户「${user.username}」？该用户的评论也会一起删除，无法恢复。`)) return
  try {
    await adminDeleteUser(user.id)
    flash('用户已删除')
    await Promise.all([loadList(), loadStats()])
  } catch (err) {
    error.value = err.friendlyMessage || '删除失败'
  }
}

onMounted(() => {
  loadStats()
  loadList()
})
</script>

<template>
  <div>
    <div class="a-stats">
      <div class="a-stat">
        <div class="a-stat-value">{{ stats.users }}</div>
        <div class="a-stat-label">用户总数</div>
      </div>
      <div class="a-stat accent">
        <div class="a-stat-value">{{ stats.admins }}</div>
        <div class="a-stat-label">管理员</div>
      </div>
      <div class="a-stat warn">
        <div class="a-stat-value">{{ stats.today }}</div>
        <div class="a-stat-label">今日新增</div>
      </div>
    </div>

    <div class="a-card">
      <div class="a-toolbar">
        <input
          v-model="keyword"
          class="a-input"
          type="text"
          placeholder="请输入用户名或邮箱"
          @keyup.enter="search"
        />
        <button type="button" class="a-btn a-btn-primary" :disabled="loading" @click="search">查询</button>
        <button type="button" class="a-btn a-btn-ghost" @click="keyword = ''; search()">重置</button>
        <span class="a-muted" style="margin-left: auto; color: #8a97a8; font-size: 13px">
          共 {{ total }} 个用户
        </span>
      </div>

      <p v-if="error" class="a-msg a-msg-error">{{ error }}</p>
      <p v-else-if="notice" class="a-msg a-msg-ok">{{ notice }}</p>

      <div class="a-table-wrap">
        <table class="a-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>用户</th>
              <th>邮箱</th>
              <th>评论数</th>
              <th>身份</th>
              <th>注册时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="7" class="a-empty">加载中…</td>
            </tr>
            <tr v-else-if="!list.length">
              <td colspan="7" class="a-empty">没有匹配的用户</td>
            </tr>
            <tr v-for="user in list" v-else :key="user.id">
              <td>{{ user.id }}</td>
              <td class="nowrap">
                <img class="a-avatar" :src="resolveAssetUrl(user.avatar)" alt="" />
                {{ user.username }}
              </td>
              <td class="muted">{{ user.email }}</td>
              <td>{{ user.commentCount }}</td>
              <td>
                <span class="a-tag" :class="user.isAdmin ? 'a-tag-blue' : 'a-tag-gray'">
                  {{ user.isAdmin ? '管理员' : '普通用户' }}
                </span>
              </td>
              <td class="nowrap muted">{{ formatTime(user.created_at) }}</td>
              <td>
                <div class="a-ops">
                  <button
                    type="button"
                    class="a-btn a-btn-sm"
                    :class="user.isAdmin ? 'a-btn-ghost' : 'a-btn-primary'"
                    @click="toggleAdmin(user)"
                  >
                    {{ user.isAdmin ? '取消管理员' : '设为管理员' }}
                  </button>
                  <button type="button" class="a-btn a-btn-sm a-btn-ghost" @click="resetPassword(user)">
                    重置密码
                  </button>
                  <button type="button" class="a-btn a-btn-sm a-btn-danger" @click="remove(user)">删除</button>
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
  </div>
</template>
