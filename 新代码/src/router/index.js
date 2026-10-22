import { createRouter, createWebHistory } from 'vue-router'

// 原项目是 29 个 HTML 文件的多页站，这里先用 5 条路由验证骨架。
// 之后每迁移一个页面，只是往这个数组里加一条记录，不用再复制导航栏和页脚。
const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: '首页' }
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
