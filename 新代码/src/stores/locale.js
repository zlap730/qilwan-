// 语言状态：zh-CN / en，持久化到 localStorage，并同步给 vue-i18n
//
// 为什么要单独一个 store：
//   组件里用 useI18n() 只能读，切换语言需要同时改 i18n.global.locale 和 localStorage；
//   集中在这里做，任何地方只要调 localeStore.toggle() 就行。
import { defineStore } from 'pinia'

import i18n, { LOCALE_KEY } from '@/i18n'

export const useLocaleStore = defineStore('locale', {
  state: () => ({
    locale: localStorage.getItem(LOCALE_KEY) === 'en' ? 'en' : 'zh-CN'
  }),

  getters: {
    isEnglish: (state) => state.locale === 'en',
    // 给数据类内容用：en 时去取 *_en 数据，中文时用原数据
    other: (state) => (state.locale === 'en' ? 'zh-CN' : 'en')
  },

  actions: {
    setLocale(next) {
      this.locale = next === 'en' ? 'en' : 'zh-CN'
      i18n.global.locale.value = this.locale
      localStorage.setItem(LOCALE_KEY, this.locale)
      // 让 <html lang> 跟着变，利于浏览器翻译提示和读屏
      document.documentElement.lang = this.locale
    },

    toggle() {
      this.setLocale(this.locale === 'en' ? 'zh-CN' : 'en')
    },

    // 应用启动时调用一次
    init() {
      this.setLocale(this.locale)
    }
  }
})
