import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/base.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// 迁移要点 2：原来每个页面都要在内联 <script> 里判断一次 cookie 里有没有 user，
// 现在只在启动时恢复一次登录态，所有页面共享。
import { useUserStore } from './stores/user'
useUserStore().restore()

app.mount('#app')
