import { createRouter, createWebHistory } from 'vue-router'

import { useUserStore } from '@/stores/user'

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
    // 原 HTML/个人信息.html：资料修改 / 头像 / 改密码 / 我的评论（需要登录）
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { title: '个人中心' }
  },
  {
    // 找回密码：邮箱验证码两步流程（原站没有，属于新增功能）
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('@/views/ForgotPasswordView.vue'),
    meta: { title: '找回密码', bare: true }
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
  {
    // 后台管理：左侧菜单 + 三个子页面，只有 isAdmin 能进（守卫在下面）
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAdmin: true, bare: true },
    children: [
      { path: '', redirect: '/admin/users' },
      {
        path: 'users',
        name: 'admin-users',
        component: () => import('@/views/admin/AdminUsersView.vue'),
        meta: { title: '用户管理', requiresAdmin: true, bare: true }
      },
      {
        path: 'comments',
        name: 'admin-comments',
        component: () => import('@/views/admin/AdminCommentsView.vue'),
        meta: { title: '评论管理', requiresAdmin: true, bare: true }
      },
      {
        path: 'review',
        name: 'admin-review',
        component: () => import('@/views/admin/AdminReviewView.vue'),
        meta: { title: '评论审核', requiresAdmin: true, bare: true }
      }
    ]
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

// 后台守卫：没登录先去登录页（登录后自动跳回来），登录了但不是管理员则回首页
// 注意：这里不要用 window.alert 弹提示——页面会被阻塞，体验也不好；用一个 query 让首页去提示
router.beforeEach((to) => {
  if (!to.meta.requiresAdmin) return true

  const store = useUserStore()
  if (!store.isLoggedIn) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  if (!store.user?.isAdmin) {
    return { path: '/', query: { denied: 'admin' } }
  }
  return true
})

export default router
