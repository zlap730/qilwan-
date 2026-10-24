<!--
  AdminLayout.vue —— 后台管理框架（左侧深色菜单 + 顶部蓝色条 + 右侧内容）
  被 /admin/* 的路由复用，参考你给的「易购后台管理系统」截图布局。

  结构：
    左侧 200px 深色菜单：用户管理 / 评论管理 / 评论审核
    顶部 50px 蓝色条：面包屑标题 + 当前管理员 + 退出 / 回前台
    右侧：浅灰底 + 白色内容卡（由各子页面自己渲染）

  权限：进入这里的前提是 store.user.isAdmin，路由守卫在 router/index.js 里拦截。
-->
<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const store = useUserStore()

const MENU = [
  { to: '/admin/users', label: '用户管理', icon: '👤' },
  { to: '/admin/comments', label: '评论管理', icon: '💬' },
  { to: '/admin/review', label: '评论审核', icon: '✅' }
]

const pageTitle = computed(() => route.meta.title || '管理后台')

function logout() {
  store.logout()
  router.push('/login')
}
</script>

<template>
  <div class="admin">
    <aside class="side">
      <div class="brand">
        <span class="brand-mark">🚲</span>
        <span class="brand-text">骑乐网后台</span>
      </div>

      <nav class="menu">
        <router-link v-for="item in MENU" :key="item.to" :to="item.to" class="menu-item">
          <span class="menu-icon">{{ item.icon }}</span>
          {{ item.label }}
        </router-link>
      </nav>

      <router-link to="/" class="back-front">← 返回前台</router-link>
    </aside>

    <div class="main">
      <header class="topbar">
        <div class="crumb">{{ pageTitle }}</div>
        <div class="top-right">
          <span class="welcome">欢迎：{{ store.displayName }}</span>
          <button type="button" class="top-link" @click="logout">退出</button>
        </div>
      </header>

      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin {
  display: flex;
  min-height: 100vh;
  background: #f0f2f5;
  font-family: 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
}

/* ── 左侧菜单 ── */
.side {
  display: flex;
  flex-direction: column;
  flex: 0 0 200px;
  width: 200px;
  background: #1f2a37;
  color: #c3cfdd;
  position: sticky;
  top: 0;
  height: 100vh;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 56px;
  padding: 0 16px;
  background: #17212c;
  color: #fff;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 1px;
}

.brand-mark {
  font-size: 18px;
}

.menu {
  display: flex;
  flex-direction: column;
  padding: 10px 0;
  flex: 1 1 auto;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  color: #c3cfdd;
  font-size: 14px;
  text-decoration: none;
  border-left: 3px solid transparent;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.menu-item:hover {
  background: #263444;
  color: #fff;
}

/* 当前页：蓝色竖条 + 深蓝底，和截图里的选中态一致 */
.menu-item.router-link-active {
  background: #1890ff;
  color: #fff;
  border-left-color: #69c0ff;
}

.menu-icon {
  font-size: 15px;
}

.back-front {
  padding: 14px 18px;
  color: #7f8ea3;
  font-size: 13px;
  text-decoration: none;
  border-top: 1px solid #263444;
}

.back-front:hover {
  color: #fff;
}

/* ── 右侧 main ── */
.main {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding: 0 20px;
  background: #2d8cf0;
  color: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
}

.crumb {
  font-size: 15px;
  font-weight: 700;
}

.top-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.welcome {
  font-size: 13px;
  opacity: 0.95;
}

.top-link {
  padding: 4px 12px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 4px;
  background: transparent;
  color: #fff;
  font-family: inherit;
  font-size: 13px;
  cursor: pointer;
}

.top-link:hover {
  background: rgba(255, 255, 255, 0.16);
}

.content {
  flex: 1 1 auto;
  padding: 16px;
  min-width: 0;
}
</style>
