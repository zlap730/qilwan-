import { createRouter, createWebHistory } from 'vue-router'

// 原项目是 29 个 HTML 文件的多页站，这里按「一个页面一条路由」逐步迁移。
// 首页 = 旧站的「自己组装/保养/维修爱车」工具入口页；关于网站单独一条路由。
const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/AboutView.vue'),
    meta: { title: '关于网站' }
  },
  {
    // 旧站里还没写内容的页面（维修工具 / 刹车 / 异响 / 配件 …）先落到这里
    path: '/pending/:name',
    name: 'pending',
    component: () => import('@/views/PendingView.vue'),
    meta: { title: '页面整理中' }
  },
  {
    path: '/forum',
    name: 'forum',
    component: () => import('@/views/ForumView.vue'),
    meta: { title: '讨论区' }
  },
  {
    path: '/calculator',
    name: 'calculator',
    component: () => import('@/views/CalculatorView.vue'),
    meta: { title: '装配清单' }
  },
  {
    path: '/shifters',
    name: 'shifters',
    component: () => import('@/views/ShifterView.vue'),
    meta: { title: '变速器大全' }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: '登录 / 注册', bare: true }
  },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  }
})

router.afterEach((to) => {
  const base = '骑乐网 · 普骑屋'
  document.title = to.meta.title ? `${to.meta.title} | ${base}` : base
})

export default router
