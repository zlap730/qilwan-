<!--
  ArticlesView.vue —— 骑行知识 · 文章列表
  路由：/articles

  5 篇文章的卡片列表：运动简介 / 装备介绍 / 骑行知识 / 公路车 / 山地车。
  每张卡显示标题、一句摘要、封面，点进去是 /article/:slug。
  对应旧站：运动简介.html、装备介绍.html、骑行知识.html、公路车.html、山地车.html 五个独立页面。

  数据来源：@/data/articles.js（标题、摘要、封面）；正文图片在 public/articles/
-->
<script setup>
import { articles } from '@/data/articles'

/*
 * 文章列表页。
 * 旧站没有统一的「文章」入口：运动简介、装备介绍、骑行知识、公路车、山地车
 * 分散在不同目录的 HTML 里。这里把它们收成一张卡片网格，
 * 点击进入 /article/:slug（路由由外部接线）。
 */
</script>

<template>
  <main class="page-articles">
    <header class="hero">
      <p class="kicker">ARTICLES</p>
      <h1>骑行知识</h1>
      <p class="lead">
        把旧站里关于自行车运动、装备和骑行技巧的内容整理到一起：先认识这项运动，再看装备，最后练动作。
      </p>
      <p class="count">共 {{ articles.length }} 篇</p>
    </header>

    <div class="card-grid">
      <router-link
        v-for="a in articles"
        :key="a.slug"
        :to="`/article/${a.slug}`"
        class="card"
      >
        <!-- 有 cover 用真图；没有 cover（运动简介）用橙色渐变 + 首字占位 -->
        <div class="card-cover" :class="{ 'is-placeholder': !a.cover }">
          <img v-if="a.cover" :src="a.cover" :alt="a.title" loading="lazy" />
          <span v-else aria-hidden="true">{{ a.title.slice(0, 1) }}</span>
        </div>

        <div class="card-body">
          <h2>{{ a.title }}</h2>
          <p class="summary">{{ a.summary }}</p>
          <span class="more">阅读全文 →</span>
        </div>
      </router-link>
    </div>
  </main>
</template>

<style scoped>
.page-articles {
  min-height: 100vh;
  padding: 90px 0 clamp(40px, 5vw, 70px);
  background: linear-gradient(180deg, #f8fbff 0%, #fdf4e6 50%, #f9ead8 100%);
}

/* 容器宽度跟着视口走，2560 时也不会超过 1000，1024 时留出两侧呼吸空间 */
.hero,
.card-grid {
  width: min(1000px, 92vw);
  margin: 0 auto;
}

.hero {
  padding: 8px 0 26px;
}

.kicker {
  margin: 0 0 10px;
  color: #c47a2c;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 5px;
}

.hero h1 {
  margin: 0 0 14px;
  color: #33261a;
  font-family: '幼圆', 'YouYuan', '微软雅黑', sans-serif;
  font-size: clamp(28px, 3vw, 42px);
  letter-spacing: 3px;
}

.lead {
  max-width: 760px;
  margin: 0;
  color: #5f4b36;
  font-size: clamp(14px, 1.1vw, 17px);
  line-height: 1.95;
}

.count {
  margin: 12px 0 0;
  color: #a3825e;
  font-size: 13px;
  letter-spacing: 1px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: clamp(14px, 1.6vw, 22px);
}

.card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 8px 24px rgba(150, 115, 70, 0.12);
  text-decoration: none;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 30px rgba(150, 115, 70, 0.22);
}

.card:focus-visible {
  outline: 3px solid rgba(232, 134, 60, 0.55);
  outline-offset: 3px;
}

.card-cover {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: #f6e6d3;
}

.card-cover img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s ease;
}

.card:hover .card-cover img {
  transform: scale(1.045);
}

/* 没有封面的文章：橙色渐变底 + 标题首字，不留空白色块 */
.card-cover.is-placeholder {
  background:
    radial-gradient(circle at 78% 22%, rgba(255, 255, 255, 0.5) 0 12%, transparent 12.5%),
    linear-gradient(135deg, #fbe7cd 0%, #f5c68c 55%, #e8863c 100%);
}

.card-cover.is-placeholder span {
  color: rgba(122, 74, 30, 0.62);
  font-family: '幼圆', 'YouYuan', '微软雅黑', sans-serif;
  font-size: clamp(48px, 5vw, 76px);
  font-weight: 900;
  line-height: 1;
  text-shadow: 0 2px 0 rgba(255, 255, 255, 0.35);
}

.card-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: clamp(14px, 1.5vw, 20px);
}

.card-body h2 {
  margin: 0 0 8px;
  color: #33261a;
  font-family: '幼圆', 'YouYuan', '微软雅黑', sans-serif;
  font-size: clamp(18px, 1.5vw, 22px);
  letter-spacing: 1px;
}

.summary {
  flex: 1;
  margin: 0 0 14px;
  color: #6b5a45;
  font-size: clamp(13px, 0.95vw, 15px);
  line-height: 1.85;
}

.more {
  color: #e8863c;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1px;
}

.card:hover .more {
  color: #c96a21;
}
</style>
