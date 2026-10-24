import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import i18n from './i18n'
import './assets/base.css'

const app = createApp(App)

app.use(createPinia())
app.use(i18n)
app.use(router)

// 迁移要点 2：原来每个页面都要在内联 <script> 里判断一次 cookie 里有没有 user，
// 现在只在启动时恢复一次登录态，所有页面共享。
import { useUserStore } from './stores/user'
import { useLocaleStore } from './stores/locale'
useUserStore().restore()
useLocaleStore().init()

app.mount('#app')
