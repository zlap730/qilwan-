<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import NavBar from '@/components/NavBar.vue'
import FooterBar from '@/components/FooterBar.vue'

const route = useRoute()
// 登录页在原项目里是独立整屏页面，没有导航栏和页脚
const bare = computed(() => route.meta.bare === true)
</script>

<template>
  <NavBar v-if="!bare" />

  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>

  <FooterBar v-if="!bare" />
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
</style>
