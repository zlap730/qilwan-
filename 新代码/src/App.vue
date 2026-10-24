<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import NavBar from '@/components/NavBar.vue'
import FooterBar from '@/components/FooterBar.vue'

const route = useRoute()
const router = useRouter()

// 登录页 / 后台在原项目里是独立整屏页面，没有导航栏和页脚
const bare = computed(() => route.meta.bare === true)

// 非管理员访问 /admin 时，路由守卫会带 ?denied=admin 回到首页；这里给一句提示
const deniedTip = ref('')
let deniedTimer

watch(
  () => route.query.denied,
  (value) => {
    if (value !== 'admin') return
    deniedTip.value = '需要管理员权限才能进入后台'
    clearTimeout(deniedTimer)
    deniedTimer = setTimeout(() => {
      deniedTip.value = ''
    }, 3000)

    // 把 query 去掉，避免刷新又提示一次
    const query = { ...route.query }
    delete query.denied
    router.replace({ path: route.path, query })
  },
  { immediate: true }
)
</script>

<template>
  <NavBar v-if="!bare" />

  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>

  <FooterBar v-if="!bare" />

  <transition name="fade">
    <p v-if="deniedTip" class="denied-tip">{{ deniedTip }}</p>
  </transition>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.denied-tip {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000;
  margin: 0;
  padding: 10px 22px;
  border-radius: 999px;
  background: rgba(40, 40, 40, 0.88);
  color: #fff;
  font-size: 14px;
}
</style>
