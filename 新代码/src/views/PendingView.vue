<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

/*
 * 「页面整理中」占位页。
 * 旧站里 维修工具 / 刹车 / 异响 / 配件 / 服装头盔 / 车架 这几页其实只有一个导航条，
 * 点进去是空白（见 旧代码/HTML/维修工具.html 等）。迁移时先给一个明确的落地页，
 * 避免点进去一片空白，也方便之后把内容补进来。
 */
const route = useRoute()
const name = computed(() => String(route.params.name || '这个页面'))
</script>

<template>
  <main class="page-pending">
    <section class="card">
      <p class="tag">页面整理中</p>
      <h1>「{{ name }}」</h1>
      <p class="desc">
        旧站里这一页还没有写内容，迁移新版时先把入口留着，等资料整理好会补在这里。
      </p>

      <div class="links">
        <span>可以先看：</span>
        <router-link to="/shifters">变速器大全</router-link>
        <router-link to="/calculator">装配清单</router-link>
        <router-link to="/forum">讨论区</router-link>
        <router-link to="/about">关于网站</router-link>
      </div>

      <router-link class="back" to="/">← 返回首页</router-link>
    </section>
  </main>
</template>

<style scoped>
.page-pending {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 90px 20px 40px;
  background: linear-gradient(180deg, #f8fbff 0%, #fdf4e6 55%, #f9ead8 100%);
  box-sizing: border-box;
}

.card {
  width: min(560px, 92vw);
  padding: clamp(24px, 3vw, 40px);
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 14px 40px rgba(150, 115, 70, 0.16);
  text-align: center;
}

.tag {
  display: inline-block;
  margin: 0 0 14px;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(232, 134, 60, 0.15);
  color: #c47a2c;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 2px;
}

h1 {
  margin: 0 0 14px;
  font-family: '幼圆', 'YouYuan', '微软雅黑', sans-serif;
  font-size: clamp(22px, 2.2vw, 30px);
  color: #33261a;
}

.desc {
  margin: 0 0 20px;
  color: #6b5a45;
  font-size: clamp(14px, 1.05vw, 16px);
  line-height: 1.9;
}

.links {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 24px;
  color: #8a7761;
  font-size: 14px;
}

.links a {
  padding: 6px 14px;
  border-radius: 999px;
  background: #fdf3e3;
  color: #b96a26;
  font-weight: 700;
  text-decoration: none;
}

.links a:hover {
  background: #f8e3c6;
}

.back {
  display: inline-block;
  padding: 10px 26px;
  border-radius: 999px;
  background: #e8863c;
  color: #fff;
  font-weight: 700;
  text-decoration: none;
}

.back:hover {
  background: #d2762f;
}
</style>
