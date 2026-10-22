import { defineStore } from 'pinia'

// 原项目的登录态是「两份」：sessionStorage.token（JWT）+ document.cookie.user（明文用户 JSON），
// 每个页面各自解析一遍。这里统一收进 Pinia：token 用 localStorage 持久化，
// 用户信息跟着 token 一起存，页面里只用 store.isLoggedIn 判断。
const TOKEN_KEY = 'qile.token'
const USER_KEY = 'qile.user'

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null')
  } catch {
    return null
  }
}

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    user: null
  }),

  getters: {
    isLoggedIn: (state) => Boolean(state.token && state.user),
    displayName: (state) => state.user?.username || '未登录',
    userId: (state) => state.user?.id ?? null
  },

  actions: {
    // 应用启动时调用一次，替代原来每个页面里的 cookie 解析
    restore() {
      this.token = localStorage.getItem(TOKEN_KEY) || ''
      this.user = readStoredUser()
      if (!this.token) this.user = null
    },

    setSession({ token, user }) {
      this.token = token || ''
      this.user = user || null

      if (this.token) localStorage.setItem(TOKEN_KEY, this.token)
      else localStorage.removeItem(TOKEN_KEY)

      if (this.user) localStorage.setItem(USER_KEY, JSON.stringify(this.user))
      else localStorage.removeItem(USER_KEY)
    },

    updateUser(patch) {
      if (!this.user) return
      this.user = { ...this.user, ...patch }
      localStorage.setItem(USER_KEY, JSON.stringify(this.user))
    },

    logout() {
      this.setSession({ token: '', user: null })
    }
  }
})
