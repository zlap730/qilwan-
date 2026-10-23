<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useUserStore } from '@/stores/user'
import { resolveAvatar } from '@/utils/asset'
import placeholder from '@/assets/img/图标文件/占位.png'
import '@/assets/legacy/导航栏.css'

const store = useUserStore()
const router = useRouter()
const open = ref(false)

// 后端注册时把默认头像写成 /img/图标文件/默认头像.png，但这个文件根本不存在（img 目录里没有
// 默认头像.png，只有 app/uploads/default_avatar.png），所以新用户头像一定是裂图。
// 迁移版先在前端兜底，正确做法是改后端那一行。
function onAvatarError(event) {
  event.target.src = placeholder
}

/*
 * 原实现：每个 HTML 都复制一份这坨 <nav>，hover 效果靠 onmouseover="jr1(this)" 调全局函数
 * 直接改 el.style.borderBottom，所以每页都得再引一次 导航栏.js。
 * 迁移后：导航只写这一次，7 个页面共享；hover 交给 CSS，全局函数 jr1/lk1 可以整体删除。
 */
const navItems = [
  { label: '首页', to: '/' },
  { label: '整车推荐', to: '/bikes' },
  { label: '人身装备', to: '/pending/人身装备' },
  { label: 'DIY清单计算', to: '/calculator' },
  { label: '讨论区', to: '/forum' },
  { label: '关于网站', to: '/about' }
]

function close() {
  open.value = false
}

function onDocumentClick() {
  close()
}

function logout() {
  store.logout()
  close()
  router.push('/')
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick))
</script>

<template>
  <nav id="nav_1">
    <ul id="ul_nav">
      <li v-for="item in navItems" :key="item.label">
        <router-link v-if="item.to" :to="item.to" @click="close">{{ item.label }}</router-link>
        <span v-else class="nav-todo" :title="`原页面 ${item.source} 不在本次验证范围内`">
          {{ item.label }}
        </span>
      </li>
    </ul>

    <router-link to="/" aria-label="返回首页">
      <img src="/logo.jpg" alt="logo" id="img_nav" />
    </router-link>

    <!-- 原来这段是每个页面内联 script 里拼 innerHTML + 手动 addEventListener，现在是一个组件 -->
    <div class="nav-user" @click.stop>
      <template v-if="store.isLoggedIn">
        <button type="button" class="nav-user-btn" :aria-expanded="open" @click="open = !open">
          <img class="nav-avatar" :src="resolveAvatar(store.user)" :alt="store.displayName" @error="onAvatarError" />
          <span>{{ store.displayName }}</span>
        </button>

        <div v-show="open" class="nav-dropdown">
          <router-link to="/profile" @click="close">个人信息</router-link>
          <router-link to="/articles" @click="close">骑行知识</router-link>
          <router-link to="/map" @click="close">车店地图</router-link>
          <span class="nav-tip">个人空间依赖后端 /api/posts，尚未迁移</span>
          <a href="#" @click.prevent="logout">退出账号</a>
        </div>
      </template>

      <router-link v-else class="nav-login" to="/login">登录</router-link>
    </div>
  </nav>
</template>

<style scoped>
.nav-todo {
  display: block;
  width: 100%;
  height: 40px;
  padding-top: 15px;
  color: rgba(255, 255, 255, 0.6);
  text-shadow: 1px 1px 0 #000;
  cursor: not-allowed;
}

.nav-user {
  position: absolute;
  top: 12px;
  right: 130px;
}

.nav-user-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 2px 10px 2px 2px;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
  font: inherit;
  font-size: 15px;
  cursor: pointer;
}

.nav-avatar {
  width: 34px;
  height: 34px;
  border: 2px solid #fff;
  border-radius: 50%;
  background: #fff;
  object-fit: cover;
}

.nav-dropdown {
  position: absolute;
  top: 48px;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 190px;
  padding: 10px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  z-index: 1001;
}

.nav-dropdown a {
  color: #c0392b;
  font-size: 14px;
}

.nav-tip {
  color: #888;
  font-size: 12px;
  line-height: 1.4;
}

.nav-login {
  display: inline-block;
  padding: 8px 20px;
  border-radius: 6px;
  background: #e8863c;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
}

.nav-login:hover {
  background: #d2762f;
}

/* ============================================================
   PC 自适应（1024 ~ 2560 全宽通用）
   原样式：7 个菜单项各写死 100px、整体从左侧 40px 开始。
   现在：菜单整组仍靠左排（左对齐，不居中），每项宽度跟着文字走，
   间隙用 clamp 随屏宽微调，右侧给 logo 和登录区留出固定位置。
   ============================================================ */
#nav_1 {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 clamp(16px, 2vw, 32px);
  box-sizing: border-box;
}

#ul_nav {
  flex: 0 1 auto;
  display: flex;
  justify-content: flex-start;
  gap: clamp(4px, 0.7vw, 18px);
  /* 靠左排，不再用 margin:auto 居中；给自己留出右侧 logo(100px)+登录区(130px) 的空间 */
  width: auto;
  max-width: calc(100% - 300px);
  margin: 0;
  padding: 0;
  left: 0;
}

#ul_nav li {
  flex: 0 1 auto;
  width: auto;
  min-width: 0;
  left: 0;
  text-align: left;
}

/* 文字左对齐，链接宽度跟着文字走（下划线也只压在文字下面） */
#ul_nav li a,
#ul_nav li a:link,
.nav-todo {
  width: auto;
  padding-left: 10px;
  padding-right: 10px;
  text-align: left;
  white-space: nowrap;
}

/* 当前所在页的菜单项：只把文字变成橙色，不加下划线
   （只对「完全匹配」生效，否则 首页 会在所有页面都亮着） */
#ul_nav li a.router-link-exact-active {
  border-bottom: 0;
  color: rgb(252, 158, 70);
}

/* 1280~1440 之间字号收一点，7 个菜单不会挤在一起 */
@media (max-width: 1440px) {
  #ul_nav {
    gap: 10px;
  }

  #ul_nav li a,
  .nav-todo {
    font-size: 17px;
    padding-left: 8px;
    padding-right: 8px;
  }
}

@media (max-width: 1280px) {
  #ul_nav {
    gap: 6px;
  }

  #ul_nav li a,
  .nav-todo {
    font-size: 15.5px;
    padding-left: 6px;
    padding-right: 6px;
  }
}
</style>
