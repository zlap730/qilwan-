<script setup>
import { ref } from 'vue'

import 手变图 from '@/assets/img/手变.png'
import 前拨图 from '@/assets/img/前拨.jpg'
import 后拨图 from '@/assets/img/后拨.avif'
import 变速视频图 from '@/assets/img/hq720.jpg'

/*
 * 变速器调试页：原 HTML/变速器调试.html
 *   + JS文件/变速器异响盒子变化.js（点标签切换 3 组内容）
 *   + JS文件/变速器动画设置.js（鼠标移到列表项上显示对应图片）
 * 原实现是 DOM 上挂 onclick/onmouseover 改 display，这里改成 Vue 的两个状态：
 *   partIndex（原理图的当前项）、tabIndex（异响的当前标签）。
 * 视频（55MB 本地 mp4）没有搬过来，改成指向原 UP 的 B 站链接。
 */

const 原理项 = [
  { label: '左右变速器', desc: '也就是我们常说的：手变、指拨变速器', img: 手变图 },
  { label: '前拨', desc: '前拨用来将链条挂上牙盘', img: 前拨图 },
  { label: '后拨', desc: '后拨用来将链条挂上飞轮', img: 后拨图 }
]

const 异响标签 = [
  {
    label: '变速不准',
    items: [
      { title: '变速线张力问题', text: '长时间使用后，变速线可能会松弛，导致无法准确传递变速指令。变速线在车架线槽内受到磨损或摩擦增大，也会影响张力。' },
      { title: '限位螺丝调节不当', text: '后拨或前拨上的高低限位螺丝决定了变速器的移动范围。如果螺丝调节有误，会使链条无法准确切换到对应齿盘。' },
      { title: '后拨或前拨变形', text: '受到外力撞击，后拨或前拨的结构可能发生变形，影响其对链条的精准引导。可以检查一下尾钩情况。' },
      { title: '变速线断裂', text: '变速线在长时间使用后可能会出现断裂，导致变速器无法准确传递变速指令。' }
    ],
    video: true
  },
  {
    label: '链条跳齿',
    items: [
      { title: '变速线拉线比问题', text: '长时间使用或不规范调整，变速线可能未调整到最佳状态，导致无法准确拉到对应位置。因此踩踏时也会受到链条的影响。' },
      { title: '飞轮磨损问题', text: '飞轮齿片磨损严重，尤其是个别齿片磨损，会导致变速时链条不能顺利挂住齿片。' },
      { title: '链条磨损', text: '链条过度拉长或磨损不均匀，在与飞轮结合时就容易出现跳齿、变速不准的情况。' },
      { title: '受到外力撞击', text: '如果后拨或前拨受到撞击，变速器的结构可能发生变形，影响其对链条的精准引导。' }
    ]
  },
  {
    label: '链条异响',
    paragraphs: [
      '一般来说，如果链条噪声很大，多半与变速器调整有关。',
      '如果你已经把变速器调整到最佳状态，再看看链条是否滴上润滑油。',
      '或者检查自行车链条是否装反（仅禧玛诺品牌有正反之分，其他品牌没有）。'
    ]
  }
]

const partIndex = ref(0)
const tabIndex = ref(0)

const 子导航 = [
  { label: '变速异常', target: '异常' },
  { label: '变速原理', target: '原理' },
  { label: '机械手变', target: '' },
  { label: '机械指拨', target: '' },
  { label: '电子变速', target: '' },
  { label: '车梁变速', target: '' },
  { label: '转把变速', target: '' }
]

function scrollTo(id) {
  if (!id) return
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <main class="page-tuning">
    <!-- 子导航：原页面顶部的「维修调试导航栏」 -->
    <nav class="subnav">
      <span class="subnav-label">维修调试导航栏</span>
      <button
        v-for="item in 子导航"
        :key="item.label"
        type="button"
        class="subnav-item"
        :class="{ disabled: !item.target }"
        :disabled="!item.target"
        @click="scrollTo(item.target)"
      >
        {{ item.label }}
      </button>
    </nav>

    <section class="block intro">
      <h1>变速器调试</h1>
      <p>变速器是骑行这门运动中不可避免要用到的工具。它像汽车的变速箱，解决了出行速度效率低下的问题。</p>
      <p>但变速器使用一段时间后会出现各种小问题：变速不准、噪音、跳齿……</p>
      <p>如果你打算在家组车，或者想自己把变速不准调回来，可以按下面的顺序排查。</p>
      <p>这篇文章在调试、安装方面尽量写详细，方便你掌握这项基础技巧。</p>
    </section>

    <section id="原理" class="block">
      <h2>先讲清楚变速是怎么形成的</h2>
      <div class="principle">
        <div class="principle-left">
          <p>自行车的变速系统主要包含以下几种部件，鼠标移到名称上可以看对应图片：</p>
          <ul class="part-list">
            <li
              v-for="(item, index) in 原理项"
              :key="item.label"
              :class="{ active: index === partIndex }"
              @mouseenter="partIndex = index"
              @focus="partIndex = index"
              tabindex="0"
            >
              {{ item.label }}
            </li>
          </ul>
          <figure class="part-figure">
            <img :src="原理项[partIndex].img" :alt="原理项[partIndex].label" />
            <figcaption>{{ 原理项[partIndex].desc }}</figcaption>
          </figure>
        </div>

        <div class="principle-right">
          <p>其中的<strong>变速方式</strong>也多种多样，最典型的两类是机械线拉和电子变速。</p>
          <p>变速器本身也有很多种类：公路车的手变头、山地的指拨器。</p>
          <p>还有一些特殊形态，比如 TT 计时车的按钮变速器，以及部分老车自带的车梁变速器。</p>
          <img class="principle-photo" :src="变速视频图" alt="变速器示意" />
        </div>
      </div>
    </section>

    <section id="异常" class="block">
      <h2>变速处异响、卡顿、跳档怎么排查</h2>
      <p class="lead">
        如果你的车在长时间骑行后出现变速处异响、变速卡顿、跳档、不灵敏，先找问题的来源，才能对症下药。
      </p>

      <div class="tabs" role="tablist">
        <button
          v-for="(tab, index) in 异响标签"
          :key="tab.label"
          type="button"
          role="tab"
          class="tab"
          :class="{ active: index === tabIndex }"
          :aria-selected="index === tabIndex"
          @click="tabIndex = index"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="tab-panel">
        <template v-if="异响标签[tabIndex].items">
          <ul class="cause-list">
            <li v-for="item in 异响标签[tabIndex].items" :key="item.title">
              <span class="cause-title">{{ item.title }}</span>
              <span class="cause-text">{{ item.text }}</span>
            </li>
          </ul>
          <p v-if="异响标签[tabIndex].video" class="video-note">
            旧站这里内嵌了一段「变速不准？可能是变速线要断！」的教学视频（55MB），
            新站没有把视频打包进来，可以直接去 UP 主页面看：
            <a href="https://space.bilibili.com/427727066" target="_blank" rel="noopener">gocyc 的 B 站主页</a>。
          </p>
        </template>

        <template v-else>
          <p v-for="(text, index) in 异响标签[tabIndex].paragraphs" :key="index">{{ text }}</p>
        </template>
      </div>
    </section>
  </main>
</template>

<style scoped>
.page-tuning {
  min-height: 100vh;
  padding: 84px 0 60px;
  background: linear-gradient(180deg, #f8fbff 0%, #fdf4e6 45%, #f9ead8 100%);
  box-sizing: border-box;
}

/* 子导航：吸顶显示，锚点跳转 */
.subnav {
  position: sticky;
  top: 60px;
  z-index: 10;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 10px;
  width: min(1100px, 92vw);
  margin: 0 auto 18px;
  padding: 10px 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 6px 18px rgba(150, 115, 70, 0.12);
  backdrop-filter: blur(4px);
}

.subnav-label {
  margin-right: 4px;
  color: #8a7761;
  font-size: 13px;
  font-weight: 700;
}

.subnav-item {
  padding: 5px 12px;
  border: 0;
  border-radius: 999px;
  background: #fdf3e3;
  color: #b96a26;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.subnav-item:hover {
  background: #f8e3c6;
}

.subnav-item.disabled {
  background: #f4f1ec;
  color: #b6ab9c;
  cursor: not-allowed;
}

.block {
  width: min(1100px, 92vw);
  margin: 0 auto 18px;
  padding: clamp(18px, 2.2vw, 30px);
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 12px 32px rgba(150, 115, 70, 0.1);
  /* 锚点跳转时给吸顶导航留出空间 */
  scroll-margin-top: 130px;
}

.intro h1 {
  margin: 0 0 12px;
  font-family: '幼圆', 'YouYuan', '微软雅黑', sans-serif;
  font-size: clamp(22px, 2.2vw, 32px);
  color: #33261a;
}

.block h2 {
  margin: 0 0 12px;
  font-family: '幼圆', 'YouYuan', '微软雅黑', sans-serif;
  font-size: clamp(18px, 1.7vw, 25px);
  color: #33261a;
}

.block p {
  margin: 0 0 10px;
  color: #4a3b2c;
  font-size: clamp(14px, 1.05vw, 16px);
  line-height: 1.9;
}

.lead {
  color: #6b5a45;
}

.principle {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: clamp(16px, 2vw, 32px);
  align-items: start;
}

.part-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 10px;
  margin: 0 0 14px;
  padding: 0;
  list-style: none;
}

.part-list li {
  padding: 6px 14px;
  border-radius: 999px;
  background: #f4f6fb;
  color: #3b4a63;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.part-list li.active {
  background: #e8863c;
  color: #fff;
}

.part-figure {
  margin: 0;
}

.part-figure img {
  width: 100%;
  max-height: 240px;
  object-fit: cover;
  border-radius: 10px;
  display: block;
}

.part-figure figcaption {
  margin-top: 8px;
  color: #6b5a45;
  font-size: 13px;
  text-align: center;
}

.principle-right {
  min-width: 0;
}

.principle-photo {
  width: 100%;
  margin-top: 8px;
  border-radius: 10px;
}

/* 异响标签 */
.tabs {
  display: flex;
  gap: 8px;
  margin: 4px 0 16px;
  flex-wrap: wrap;
}

.tab {
  padding: 8px 18px;
  border: 1px solid #f0e3d1;
  border-radius: 999px;
  background: #fffdf9;
  color: #7a6248;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.tab.active {
  border-color: #e8863c;
  background: #e8863c;
  color: #fff;
}

.cause-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.cause-list li {
  padding: 12px 14px;
  margin-bottom: 10px;
  border-left: 4px solid #f0c48a;
  border-radius: 8px;
  background: #fdf9f3;
}

.cause-title {
  display: block;
  margin-bottom: 4px;
  color: #b96a26;
  font-size: 15px;
  font-weight: 800;
}

.cause-text {
  color: #4a3b2c;
  font-size: 14px;
  line-height: 1.9;
}

.video-note {
  margin: 4px 0 0;
  color: #6b5a45;
  font-size: 13px;
  line-height: 1.9;
}

.video-note a {
  color: #c47a2c;
  font-weight: 700;
}

/* 窄屏：原理区改成上下两段 */
@media (max-width: 900px) {
  .principle {
    grid-template-columns: 1fr;
  }
}
</style>
