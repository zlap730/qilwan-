<!--
  ArticleView.vue —— 骑行知识 · 文章详情
  路由：/article/:slug（如 /article/gear）

  按 URL 里的 slug 从数据里取一篇文章，渲染标题、摘要和正文（v-html）。
  slug 对不上时显示「文章不存在」并给出返回列表的链接。
  正文里的排版规则（字号、间距、图片宽度）写在文件末尾的非 scoped 样式里。

  数据来源：@/data/articles.js
-->
<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { articles } from '@/data/articles'

/*
 * 文章详情页。
 * 旧站里这些内容是 5 个独立 HTML；迁移后统一从 articles.js 按 slug 取数据，
 * 正文的 sections 用 v-html 渲染（内容已在数据层清洗过）。
 */
const route = useRoute()
const article = computed(() => articles.find((item) => item.slug === route.params.slug))
</script>

<template>
  <main class="article-view">
    <article v-if="article" class="article-shell">
      <header class="article-head">
        <p class="kicker">ARTICLE</p>
        <h1>{{ article.title }}</h1>
        <p class="summary">{{ article.summary }}</p>
      </header>

      <section
        v-for="(section, index) in article.sections"
        :key="index"
        class="article-body"
        v-html="section.html"
      ></section>

      <footer class="article-foot">
        <router-link class="back-link" to="/articles">← 返回文章列表</router-link>
      </footer>
    </article>

    <!-- slug 对不上：给出明确的空状态，并留一条回列表的路 -->
    <div v-else class="article-missing">
      <h1>文章不存在</h1>
      <p>这个链接可能已经失效，或者这篇文章还没有迁移过来。</p>
      <router-link class="back-link" to="/articles">返回文章列表</router-link>
    </div>
  </main>
</template>

<style scoped>
.article-view {
  min-height: 100vh;
  padding: 90px 0 clamp(36px, 4vw, 60px);
  background: linear-gradient(180deg, #f8fbff 0%, #fdf4e6 50%, #f9ead8 100%);
}

/* 正文宽度按约定用 min(900px, 92vw)，1024 ~ 2560 都不会撑出横向滚动条 */
.article-shell,
.article-missing {
  width: min(900px, 92vw);
  margin: 0 auto;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 10px 30px rgba(150, 115, 70, 0.12);
}

.article-shell {
  padding: clamp(20px, 2.6vw, 38px);
}

.article-head {
  margin-bottom: 24px;
  padding-bottom: 18px;
  border-bottom: 1px solid #f1ddc6;
}

.kicker {
  margin: 0 0 10px;
  color: #c47a2c;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 5px;
}

.article-head h1 {
  margin: 0 0 12px;
  color: #33261a;
  font-family: '幼圆', 'YouYuan', '微软雅黑', sans-serif;
  font-size: clamp(26px, 3vw, 40px);
  line-height: 1.35;
  letter-spacing: 3px;
}

.summary {
  margin: 0;
  color: #7a6248;
  font-size: clamp(14px, 1.05vw, 16px);
  line-height: 1.9;
}

.article-foot {
  margin-top: 30px;
  padding-top: 18px;
  border-top: 1px dashed #ecd9c2;
}

.back-link {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 999px;
  background: #fdf1e2;
  color: #c47a2c;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.18s ease, color 0.18s ease;
}

.back-link:hover {
  background: #e8863c;
  color: #fff;
}

.article-missing {
  padding: clamp(32px, 5vw, 60px) clamp(20px, 3vw, 40px);
  text-align: center;
}

.article-missing h1 {
  margin: 0 0 14px;
  color: #33261a;
  font-family: '幼圆', 'YouYuan', '微软雅黑', sans-serif;
  font-size: clamp(24px, 2.6vw, 34px);
  letter-spacing: 2px;
}

.article-missing p {
  margin: 0 0 22px;
  color: #6b5a45;
  font-size: 15px;
  line-height: 1.9;
}
</style>

<style>
/*
 * 这段**故意不加 scoped**：
 * v-html 注入的 h1/p/ul/img/table 不会带上 scoped 的 data-v 属性，
 * 只有非 scoped 的全局选择器才能约束它们。
 * 所有规则都收在 .article-view .article-body 下面，不会影响别的页面。
 */
.article-view .article-body {
  color: #4a3b2c;
  font-size: clamp(15px, 1.05vw, 17px);
  line-height: 2;
  overflow-wrap: anywhere;
}

.article-view .article-body > :first-child {
  margin-top: 0;
}

.article-view .article-body > :last-child {
  margin-bottom: 0;
}

.article-view .article-body h1 {
  margin: 0 0 18px;
  color: #33261a;
  font-size: clamp(24px, 2.4vw, 32px);
  line-height: 1.5;
  letter-spacing: 1px;
}

.article-view .article-body h2 {
  margin: 30px 0 14px;
  padding-left: 12px;
  border-left: 4px solid #e8863c;
  color: #33261a;
  font-size: clamp(19px, 1.7vw, 24px);
  line-height: 1.55;
  letter-spacing: 1px;
}

.article-view .article-body h3 {
  margin: 24px 0 10px;
  color: #7a4a1e;
  font-size: clamp(17px, 1.4vw, 20px);
  line-height: 1.6;
}

.article-view .article-body h4 {
  margin: 20px 0 8px;
  color: #7a4a1e;
  font-size: clamp(15px, 1.2vw, 18px);
}

.article-view .article-body p {
  margin: 0 0 14px;
}

.article-view .article-body ul,
.article-view .article-body ol {
  margin: 0 0 16px;
  padding-left: 1.6em;
}

.article-view .article-body li {
  margin: 6px 0;
  line-height: 1.95;
}

.article-view .article-body li ul,
.article-view .article-body li ol {
  margin: 6px 0 0;
}

.article-view .article-body strong {
  color: #33261a;
  font-weight: 700;
}

.article-view .article-body em {
  color: #c47a2c;
}

.article-view .article-body a {
  color: #c47a2c;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.article-view .article-body a:hover {
  color: #e8863c;
}

.article-view .article-body img {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 20px auto;
  border-radius: 8px;
}

.article-view .article-body blockquote {
  margin: 18px 0;
  padding: 12px 18px;
  border-left: 4px solid #e8863c;
  border-radius: 0 8px 8px 0;
  background: #fff8ef;
  color: #6b5a45;
}

/* 多图并排：容器永远 100% 宽，图片按 flex 收缩，不会顶破正文 */
.article-view .article-body p.article-gallery {
  display: flex;
  flex-wrap: wrap;
  gap: clamp(8px, 1vw, 14px);
  margin: 20px 0;
}

.article-view .article-body p.article-gallery img {
  flex: 1 1 200px;
  width: 0;
  min-width: 0;
  aspect-ratio: 4 / 3;
  margin: 0;
  object-fit: cover;
}

.article-view .article-body p.article-figure {
  display: flex;
  flex-wrap: wrap;
  gap: clamp(8px, 1vw, 14px);
  margin: 20px 0;
}

.article-view .article-body p.article-figure > a {
  flex: 1 1 200px;
  min-width: 0;
}

.article-view .article-body p.article-figure > a > img {
  width: 100%;
  aspect-ratio: 4 / 3;
  margin: 0;
  object-fit: cover;
}

.article-view .article-body table {
  width: 100%;
  margin: 22px 0;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: clamp(13px, 0.95vw, 15px);
  line-height: 1.7;
}

.article-view .article-body th,
.article-view .article-body td {
  padding: 8px 10px;
  border: 1px solid #ecd9c2;
  text-align: left;
  vertical-align: top;
  overflow-wrap: anywhere;
}

.article-view .article-body thead th {
  background: #fdf1e2;
  color: #8a5424;
}

.article-view .article-body tbody tr:nth-child(even) {
  background: #fffaf3;
}

/* 窄一点的桌面窗口（1024 左右）把正文行高和图片间距收一点 */
@media (max-width: 1200px) {
  .article-view .article-body {
    line-height: 1.95;
  }

  .article-view .article-body img {
    margin: 16px auto;
  }
}
</style>
