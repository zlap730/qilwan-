<script setup>
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
const 入门向导 = [
  { title: '运动简介', to: '/article/sport', img: 运动简介图 },
  { title: '骑行技巧', to: '/article/knowledge', img: 骑行技巧图 },
  { title: '装备介绍', to: '/article/gear', img: 安全知识图 }
]
</script>

<template>
  <main class="page-about">
    <header class="hero">
      <p class="kicker">ABOUT</p>
      <h1>关于网站</h1>
      <p class="lead">一个纯公益性质的自行车知识共享站 —— 把骑行、维修、装配的经验整理成能看懂的东西。</p>
    </header>

    <section class="block">
      <h2>一、网站功能</h2>
      <p>
        骑行知识的宣传和讲解。这里汇聚了丰富的自行车骑行知识和维修技巧，无论是新手入门还是经验丰富的骑行者，希望都能在这找到有用的信息。
        <mark>从骑行安全（如正确佩戴头盔、遵守交通规则）到长途骑行的规划（包括路线选择、补给点设置）</mark>，我们都会涉及讲解。
      </p>
      <p>
        提供常见类型自行车骑行的技巧视频和相关 UP 的视频推荐，如爬坡技巧、控车练习、在不同路况下的骑行姿势等。
      </p>
    </section>

    <section class="block">
      <h2>二、关于网站</h2>
      <p>
        我的梦想是致力于打造一个<strong>纯公益性质</strong>的自行车知识共享网站。
        我的目标是通过传播骑行知识和维修装配等技能和知识，让更多的人了解自行车运动带来的乐趣。
        自行车作为一种小众的运动方式，我希望能够让越来越多的人能够知道自行车文化的发展。
      </p>
    </section>

    <section class="block two-col">
      <img :src="关于网站图" alt="关于网站" loading="lazy" />
      <div>
        <h2>关于我们与网站</h2>
        <ul>
          <li>本网站所提供的所有信息仅供学习和参考目的，应自行判断并承担使用这些信息所带来的风险。</li>
          <li>本网站不对因使用网站上的信息而造成的任何直接或间接损失负责，包括但不限于人身伤害、财产损失等。</li>
          <li>尽管我们尽力确保信息的准确性和完整性，但由于知识的不断更新和实际情况的多样性，信息可能存在误差，若有问题可以联系邮箱告知修改以及意见。</li>
          <li>如果涉及到版权侵权问题，请联系我们，我们会尽快处理。</li>
        </ul>
      </div>
    </section>

    <section class="block">
      <h2>入门向导</h2>
      <p class="hint">三个入口：先了解运动本身，再学技巧，最后把安全知识过一遍。</p>
      <div class="guide-grid">
        <router-link v-for="item in 入门向导" :key="item.title" :to="item.to" class="guide-card">
          <img :src="item.img" :alt="item.title" loading="lazy" />
          <span>{{ item.title }}</span>
        </router-link>
      </div>
    </section>

    <p class="contact">
      联系邮箱：<a href="mailto:Z1916819975@163.com">Z1916819975@163.com</a> · 微信号 13556870440
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
