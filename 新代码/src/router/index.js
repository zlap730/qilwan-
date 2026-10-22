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
    // 原 HTML/变速器调试.html：原理图 + 异响排查
    path: '/shifters/tuning',
    name: 'shifter-tuning',
    component: () => import('@/views/TuningView.vue'),
    meta: { title: '变速器调试' }
  },
  {
    // 原 HTML/整车页面.HTML：选车问卷 + 词云
    path: '/bikes',
    name: 'bikes',
    component: () => import('@/views/BikesView.vue'),
    meta: { title: '整车推荐' }
  },
  {
    // 原 HTML/个人信息.html：资料修改 / 注销（需要登录）
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { title: '个人信息' }
  },
  {
    // 原 HTML/地图.html：高德地图
    path: '/map',
    name: 'map',
    component: () => import('@/views/MapView.vue'),
    meta: { title: '车店地图' }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: '登录 / 注册', bare: true }
  },
  {
    // 原 HTML/运动简介.html、装备介绍.html、骑行知识.html、公路车.html、山地车.html
    // 正文统一抽到 src/data/articles.js，这里用一个列表页 + 一个详情页承接
    path: '/articles',
    name: 'articles',
    component: () => import('@/views/ArticlesView.vue'),
    meta: { title: '骑行知识' }
  },
  {
    path: '/article/:slug',
    name: 'article',
    component: () => import('@/views/ArticleView.vue'),
    meta: { title: '文章' }
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
