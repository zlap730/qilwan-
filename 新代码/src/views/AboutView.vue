<!--
  AboutView.vue —— 关于网站
  路由：/about

  介绍性页面：一、网站功能；二、关于网站（纯公益初心）；关于我们与网站（免责声明 + 配图）；
  最后是「入门向导」三张卡，分别链到运动简介 / 骑行知识 / 装备介绍三篇文章。
  对应旧站：骑乐网.html 里的「网站功能 / 关于网站 / 关于我们与网站 / 入门向导」几段。

  数据来源：正文是写在模板里的静态文字；图片来自 @/assets/img/*
-->
<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import 关于网站图 from '@/assets/img/关于网站.jpg'
import 运动简介图 from '@/assets/img/sram_gx_web_waterfall_this_is_web.webp'
import 骑行技巧图 from '@/assets/img/屏幕截图 1.png'
import 安全知识图 from '@/assets/img/屏幕截图2.png'

/*
 * 「关于网站」页：内容来自原 骑乐网.html 里的三段
 *   ① 网站功能（第 245 行起）  ② 关于网站/我的梦想  ③ 关于我们与网站声明
 * 外加原来的「入门向导」三张卡片。
 * 首页已经改成「工具入口」，所以这些介绍性内容单独放这里。
 */
const { t } = useI18n()

const disclaimerItems = computed(() => [
  t('about.disclaimerItems.0'),
  t('about.disclaimerItems.1'),
  t('about.disclaimerItems.2'),
  t('about.disclaimerItems.3')
])

const 入门向导 = computed(() => [
  { title: t('about.guides.0.title'), desc: t('about.guides.0.desc'), to: '/article/sport', img: 运动简介图 },
  { title: t('about.guides.1.title'), desc: t('about.guides.1.desc'), to: '/article/knowledge', img: 骑行技巧图 },
  { title: t('about.guides.2.title'), desc: t('about.guides.2.desc'), to: '/article/gear', img: 安全知识图 }
])
</script>

<template>
  <main class="page-about">
    <header class="hero">
      <p class="kicker">{{ t('about.kicker') }}</p>
      <h1>{{ t('about.title') }}</h1>
      <p class="lead">{{ t('about.intro') }}</p>
    </header>

    <section class="block">
      <h2>{{ t('about.featuresTitle') }}</h2>
      <p>{{ t('about.featuresText1') }}</p>
      <p>{{ t('about.featuresText2') }}</p>
    </section>

    <section class="block">
      <h2>{{ t('about.originTitle') }}</h2>
      <p>{{ t('about.originText') }}</p>
    </section>

    <section class="block two-col">
      <img :src="关于网站图" alt="关于网站" loading="lazy" />
      <div>
        <h2>{{ t('about.disclaimerTitle') }}</h2>
        <ul>
          <li v-for="(item, index) in disclaimerItems" :key="index">{{ item }}</li>
        </ul>
      </div>
    </section>

    <section class="block">
      <h2>{{ t('about.guideTitle') }}</h2>
      <p class="hint">{{ t('about.guideHint') }}</p>
      <div class="guide-grid">
        <router-link v-for="item in 入门向导" :key="item.title" :to="item.to" class="guide-card">
          <img :src="item.img" :alt="item.title" loading="lazy" />
          <span>{{ item.title }}</span>
          <small v-if="item.desc" class="guide-desc">{{ item.desc }}</small>
        </router-link>
      </div>
    </section>

    <p class="contact">
      {{ t('footer.email') }}<a href="mailto:Z1916819975@163.com">Z1916819975@163.com</a> ·
      {{ t('footer.wechat') }} 13556870440
    </p>
  </main>
</template>

<style scoped>
.page-about {
  min-height: 100vh;
  padding: 90px 0 60px;
  background: linear-gradient(180deg, #f8fbff 0%, #fdf4e6 50%, #f9ead8 100%);
}

.hero,
.block,
.contact {
  width: min(1000px, 90vw);
  margin: 0 auto;
}

.hero {
  padding: 10px 0 26px;
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
  font-family: '幼圆', 'YouYuan', '微软雅黑', sans-serif;
  font-size: clamp(28px, 3vw, 42px);
  letter-spacing: 3px;
  color: #33261a;
}

.lead {
  margin: 0;
  color: #5f4b36;
  font-size: clamp(15px, 1.15vw, 18px);
  line-height: 1.9;
}

.block {
  margin-top: 26px;
  padding: clamp(18px, 2vw, 30px);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 8px 24px rgba(150, 115, 70, 0.1);
}

.block h2 {
  margin: 0 0 14px;
  font-family: '幼圆', 'YouYuan', '微软雅黑', sans-serif;
  font-size: clamp(18px, 1.6vw, 24px);
  color: #33261a;
}

.block p {
  margin: 0 0 12px;
  color: #4a3b2c;
  font-size: clamp(14px, 1.05vw, 16px);
  line-height: 2;
}

.block p:last-child {
  margin-bottom: 0;
}

.block strong {
  color: #c0392b;
}

.block mark {
  padding: 0 2px;
  background: rgba(250, 205, 120, 0.55);
  color: inherit;
}

.two-col {
  display: flex;
  align-items: flex-start;
  gap: clamp(16px, 2vw, 32px);
  flex-wrap: wrap;
}

.two-col img {
  flex: 0 1 320px;
  width: min(320px, 100%);
  border-radius: 10px;
  object-fit: cover;
}

.two-col > div {
  flex: 1 1 380px;
  min-width: 0;
}

.two-col ul {
  margin: 0;
  padding-left: 20px;
  color: #4a3b2c;
  font-size: clamp(14px, 1.05vw, 16px);
  line-height: 2;
}

.hint {
  color: #7a6248;
}

.guide-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: clamp(12px, 1.2vw, 18px);
}

.guide-card {
  position: relative;
  display: flex;
  align-items: flex-end;
  height: clamp(150px, 14vw, 200px);
  padding: 14px;
  border-radius: 10px;
  overflow: hidden;
  background: #ddd;
  text-decoration: none;
  box-shadow: 0 8px 20px rgba(120, 88, 46, 0.16);
  transition: transform 0.18s ease;
}

.guide-card img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.guide-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 40%, rgba(0, 0, 0, 0.6) 100%);
}

.guide-card span {
  position: relative;
  z-index: 1;
  color: #fff;
  font-family: '幼圆', 'YouYuan', '微软雅黑', sans-serif;
  font-size: clamp(17px, 1.4vw, 22px);
  font-weight: 900;
  letter-spacing: 2px;
}

.guide-card:hover {
  transform: translateY(-3px);
}

.contact {
  margin-top: 26px;
  color: #6b5a45;
  font-size: 14px;
  text-align: center;
}

.contact a {
  color: #c47a2c;
}
</style>
