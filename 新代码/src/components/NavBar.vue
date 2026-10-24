<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { useLocaleStore } from '@/stores/locale'
import { useUserStore } from '@/stores/user'
import { resolveAvatar } from '@/utils/asset'
import placeholder from '@/assets/img/图标文件/占位.png'
import '@/assets/legacy/导航栏.css'

const store = useUserStore()
const router = useRouter()
const { t } = useI18n()
const localeStore = useLocaleStore()
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
 * 迁移后：导航只写这一次，所有页面共享；文字走 i18n，切换语言即时生效。
 *
 * 注意：to 里的路径保持中文（/pending/人身装备 是旧链接，路由参数是中文），只翻译显示文字。
 */
const navItems = computed(() => [
  { label: t('nav.home'), to: '/' },
  { label: t('nav.bikes'), to: '/bikes' },
  { label: t('nav.gear'), to: '/pending/人身装备' },
  { label: t('nav.calculator'), to: '/calculator' },
  { label: t('nav.forum'), to: '/forum' },
  { label: t('nav.about'), to: '/about' }
])

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

function switchLanguage(next) {
  localeStore.setLocale(next)
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick))
</script>

<template>
  <nav id="nav_1">
    <ul id="ul_nav">
      <li v-for="item in navItems" :key="item.to">
        <router-link v-if="item.to" :to="item.to" @click="close">{{ item.label }}</router-link>
        <span v-else class="nav-todo">{{ item.label }}</span>
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
          <router-link to="/profile" @click="close">{{ t('nav.profile') }}</router-link>

          <!-- 语言切换：放在「个人信息」下面，两个按钮点一下就切 -->
          <div class="nav-lang">
            <span class="nav-lang-label">{{ t('nav.language') }}</span>
            <div class="nav-lang-btns">
              <button
                type="button"
                class="nav-lang-btn"
                :class="{ active: !localeStore.isEnglish }"
                @click="switchLanguage('zh-CN')"
              >
                中文
              </button>
              <button
                type="button"
                class="nav-lang-btn"
                :class="{ active: localeStore.isEnglish }"
                @click="switchLanguage('en')"
              >
                English
              </button>
            </div>
          </div>

          <router-link to="/articles" @click="close">{{ t('nav.articles') }}</router-link>
          <router-link to="/map" @click="close">{{ t('nav.map') }}</router-link>
          <!-- 只有管理员才看得到后台入口 -->
          <router-link v-if="store.user?.isAdmin" to="/admin/users" class="nav-admin" @click="close">
            {{ t('nav.admin') }}
          </router-link>
          <a href="#" @click.prevent="logout">{{ t('nav.logout') }}</a>
        </div>
      </template>

      <router-link v-else class="nav-login" to="/login">{{ t('nav.login') }}</router-link>
    </div>
  </nav>
</template>

<style scoped>
/* 英文标签比中文长：旧 CSS 把 li / a 都写死 100px，英文会折行甚至重叠。
   这里用 scoped 规则（多一个属性选择器，优先级高于全局 导航栏.css）改成按内容宽度。 */
#ul_nav {
  gap: 4px;
  left: 24px;
}

#ul_nav li {
  flex: 0 1 auto;
  width: auto;
  min-width: 0;
  height: auto;
  left: 0;
}

#ul_nav li a,
#ul_nav li a:link {
  display: block;
  width: auto;
  min-width: 72px;
  padding: 15px 14px 0;
  white-space: nowrap;
  text-align: center;
}

.nav-todo {
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
  min-width: 210px;
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

/* 后台入口用蓝色区分，一眼能认出来 */
.nav-dropdown a.nav-admin {
  color: #1890ff;
  font-weight: 700;
}

/* 语言切换块 */
.nav-lang {
  padding: 6px 0 8px;
  border-top: 1px solid #f0e6d8;
  border-bottom: 1px solid #f0e6d8;
}

.nav-lang-label {
  display: block;
  margin-bottom: 6px;
  color: #9a8b78;
  font-size: 12px;
}

.nav-lang-btns {
  display: flex;
  gap: 6px;
}

.nav-lang-btn {
  flex: 1 1 0;
  padding: 5px 0;
  border: 1px solid #e8d4b6;
  border-radius: 6px;
  background: #fffdf9;
  color: #7a6248;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.nav-lang-btn.active {
  border-color: #e8863c;
  background: #e8863c;
  color: #fff;
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
</style>
