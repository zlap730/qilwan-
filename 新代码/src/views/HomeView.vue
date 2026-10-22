<script setup>
import 前拨图 from '@/assets/img/前拨.png'
import 后变速器图 from '@/assets/img/后变速器.png'
import 夹器图 from '@/assets/img/夹器.jpg'
import 碟刹图 from '@/assets/img/碟刹.png'
import 保养图 from '@/assets/img/保养.png'
import 工具图 from '@/assets/img/工具.png'
import 装车图 from '@/assets/img/装车.png'
import 查找异响图 from '@/assets/img/查找异响.jpg'
import 解决异响图 from '@/assets/img/异响.jpg'
import 人身装备图 from '@/assets/img/人身装备.webp'

/*
 * 首页 = 原来 骑乐网.html 里「自己组装/保养/维修爱车」+「其他自行车用品」两块。
 * 原实现是 5 个 float + position:relative 的方块硬拼出来的（#section4 写死 1400×700），
 * 这里改成 CSS Grid：第一行 2.2:1:1，第二行 装配占第 1 列、异响占后两列，
 * 布局比例和截图一致，但能跟着屏宽缩放。
 */
const 变速器入口 = [
  { label: '前变速器', to: '/shifters/tuning', img: 前拨图 },
  { label: '后变速器', to: '/shifters/tuning', img: 后变速器图 },
  { label: '圈刹夹器', to: '/pending/刹车调试', img: 夹器图 },
  { label: '碟片夹器', to: '/pending/刹车调试', img: 碟刹图 }
]

const 异响入口 = [
  { label: '查找异响', to: '/pending/异响处理', img: 查找异响图 },
  { label: '解决异响', to: '/pending/异响处理', img: 解决异响图 }
]
</script>

<template>
  <main class="page-home">
    <section class="tools">
      <h1 class="tools-title">自己组装 / 保养 / 维修爱车</h1>

      <div class="tools-grid">
        <!-- ① 变速器 | 刹车 | 调试：左侧竖排标题 + 2×2 小卡 -->
        <article class="tile tile-shift">
          <h2 class="vertical-title">变速器 | 刹车 | 调试</h2>
          <div class="shift-grid">
            <router-link v-for="item in 变速器入口" :key="item.label" :to="item.to" class="shift-card">
              <img :src="item.img" :alt="item.label" loading="lazy" />
              <span>{{ item.label }}</span>
            </router-link>
          </div>
        </article>

        <!-- ② 维修工具 -->
        <router-link class="tile tile-simple" to="/pending/维修工具">
          <h2>维修工具</h2>
          <img :src="工具图" alt="维修工具" loading="lazy" />
        </router-link>

        <!-- ③ 车辆保养 -->
        <router-link class="tile tile-simple" to="/pending/车辆保养">
          <h2>车辆保养</h2>
          <img :src="保养图" alt="车辆保养" loading="lazy" />
        </router-link>

        <!-- ④ 自行车装配：竖排标题 + 一句文案 + 图 -->
        <router-link class="tile tile-build" to="/calculator">
          <h2 class="vertical-title">自行车装配</h2>
          <div class="build-body">
            <p>
              你是否有过想要自己组装一台充满
              <span class="c1">个</span><span class="c2">性</span><span class="c3">化</span>
              的自行车，那么你可以看看这个
            </p>
            <img :src="装车图" alt="自行车装配" loading="lazy" />
          </div>
        </router-link>

        <!-- ⑤ 异响查找 / 解决 -->
        <article class="tile tile-noise">
          <p class="noise-text">
            雨骑完后是否有过因为无法解决异响的烦恼？<br />
            那你可以来看看我们提供的<em>查找方法</em>和<em>解决方法</em>
          </p>
          <div class="noise-grid">
            <router-link v-for="item in 异响入口" :key="item.label" :to="item.to" class="noise-card">
              <img :src="item.img" :alt="item.label" loading="lazy" />
              <span>{{ item.label }}</span>
            </router-link>
          </div>
        </article>
      </div>
    </section>

    <!-- 其他自行车用品（原页是一个横向切换卡，这里先用两张入口卡） -->
    <section class="goods">
      <h2>· 其他自行车用品</h2>
      <div class="goods-grid">
        <router-link class="goods-card goods-personal" to="/pending/人身装备">
          <span>人身装备</span>
        </router-link>
        <router-link class="goods-card goods-parts" to="/pending/零件道具">
          <span>零件道具</span>
        </router-link>
        <router-link class="goods-card goods-shifter" to="/shifters">
          <span>变速器大全</span>
        </router-link>
      </div>
    </section>
  </main>
</template>

<style scoped>
.page-home {
  min-height: 100vh;
  padding: 84px 0 50px;
  background: linear-gradient(180deg, #f7fbff 0%, #fdf3e3 45%, #f8e7d2 100%);
}

/* ── 橙色底板 + 蓝色方块，配色沿用原页 ── */
.tools {
  width: min(1400px, 94vw);
  margin: 0 auto;
  padding: clamp(14px, 1.8vw, 26px);
  border-radius: 12px;
  background-color: rgb(250, 195, 113);
  box-shadow: 0 10px 30px rgba(160, 110, 40, 0.16);
  box-sizing: border-box;
}

.tools-title {
  margin: 4px 0 clamp(14px, 1.6vw, 24px);
  text-align: center;
  font-family: '幼圆', 'YouYuan', '微软雅黑', sans-serif;
  font-size: clamp(22px, 2.2vw, 38px);
  font-weight: 900;
  letter-spacing: 3px;
  color: #1f1f1f;
}

.tools-grid {
  display: grid;
  /* 第一行：大卡 + 两张小卡；第二行：装配 + 异响 */
  grid-template-columns: 2.2fr 1fr 1fr;
  grid-template-areas:
    'shift tools care'
    'build noise noise';
  gap: clamp(10px, 1vw, 16px);
}

.tile {
  position: relative;
  display: flex;
  min-height: clamp(240px, 22vw, 330px);
  padding: clamp(10px, 1vw, 16px);
  border-radius: 10px;
  background-color: rgb(144, 173, 226);
  box-shadow: 0 4px 12px rgba(60, 80, 130, 0.18);
  text-decoration: none;
  color: #1c1c1c;
  overflow: hidden;
  box-sizing: border-box;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

a.tile:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 22px rgba(60, 80, 130, 0.28);
}

a.tile:hover img {
  transform: scale(1.03);
}

.tile img {
  transition: transform 0.25s ease;
}

/* 竖排标题（原来用 writing-mode: tb-rl，这里是标准写法） */
.vertical-title {
  margin: 0;
  padding: 2px 0;
  writing-mode: vertical-rl;
  letter-spacing: 0.22em;
  font-family: '幼圆', 'YouYuan', '微软雅黑', sans-serif;
  font-size: clamp(18px, 1.6vw, 30px);
  font-weight: 900;
  white-space: nowrap;
}

/* ① 变速器 */
.tile-shift {
  grid-area: shift;
  gap: clamp(8px, 1vw, 16px);
}

.shift-grid {
  flex: 1 1 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(8px, 0.8vw, 14px);
  min-width: 0;
}

.shift-card {
  display: flex;
  align-items: stretch;
  gap: 6px;
  padding: 6px;
  border-radius: 6px;
  background-color: #cac9c9;
  border: 2px solid rgba(0, 0, 0, 0.18);
  text-decoration: none;
  color: #1c1c1c;
  overflow: hidden;
  min-height: 0;
}

.shift-card img {
  flex: 1 1 auto;
  width: 55%;
  min-width: 0;
  object-fit: cover;
  border-radius: 4px;
}

.shift-card span {
  flex: 0 0 auto;
  writing-mode: vertical-rl;
  letter-spacing: 0.16em;
  font-family: '幼圆', 'YouYuan', '微软雅黑', sans-serif;
  font-size: clamp(13px, 1.05vw, 20px);
  font-weight: 900;
}

/* ②③ 维修工具 / 车辆保养 */
.tile-simple {
  grid-area: auto;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.tile-simple h2 {
  margin: 6px 0 0;
  font-family: '幼圆', 'YouYuan', '微软雅黑', sans-serif;
  font-size: clamp(17px, 1.5vw, 26px);
  font-weight: 900;
  white-space: nowrap;
}

.tile-simple img {
  width: 100%;
  flex: 1 1 auto;
  min-height: 0;
  object-fit: cover;
  border-radius: 6px;
}

/* ④ 自行车装配 */
.tile-build {
  grid-area: build;
  gap: clamp(8px, 1vw, 14px);
}

.build-body {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.build-body p {
  margin: 0;
  text-align: center;
  font-family: '幼圆', 'YouYuan', '微软雅黑', sans-serif;
  font-size: clamp(13px, 1.05vw, 18px);
  font-weight: 800;
  line-height: 1.7;
}

.build-body img {
  flex: 1 1 auto;
  width: 100%;
  min-height: 0;
  object-fit: cover;
  border-radius: 6px;
}

.c1 {
  color: #f80bb1;
}

.c2 {
  color: chocolate;
}

.c3 {
  color: gold;
}

/* ⑤ 异响 */
.tile-noise {
  grid-area: noise;
  flex-direction: column;
  gap: 12px;
}

.noise-text {
  margin: 0;
  text-align: center;
  font-family: '幼圆', 'YouYuan', '微软雅黑', sans-serif;
  font-size: clamp(13px, 1.05vw, 18px);
  font-weight: 700;
  line-height: 1.8;
}

.noise-text em {
  font-style: normal;
  color: #e2571f;
  font-weight: 900;
}

.noise-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(8px, 0.8vw, 14px);
  flex: 1 1 auto;
  min-height: 0;
}

.noise-card {
  display: flex;
  flex-direction: column;
  border-radius: 6px;
  overflow: hidden;
  background-color: #4f6a9c;
  color: #fff;
  text-decoration: none;
  min-height: 0;
}

.noise-card img {
  flex: 1 1 auto;
  width: 100%;
  min-height: 0;
  object-fit: cover;
}

.noise-card span {
  padding: 6px 4px;
  text-align: center;
  font-family: '幼圆', 'YouYuan', '微软雅黑', sans-serif;
  font-size: clamp(13px, 1vw, 18px);
  font-weight: 800;
}

/* ── 其他自行车用品 ── */
.goods {
  width: min(1400px, 94vw);
  margin: clamp(20px, 2.4vw, 34px) auto 0;
}

.goods h2 {
  margin: 0 0 14px;
  padding-left: 6px;
  font-family: '幼圆', 'YouYuan', '微软雅黑', sans-serif;
  font-size: clamp(19px, 1.7vw, 28px);
  font-weight: 900;
}

.goods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: clamp(12px, 1.2vw, 20px);
}

.goods-card {
  position: relative;
  display: flex;
  align-items: flex-end;
  height: clamp(160px, 15vw, 220px);
  padding: 18px;
  border-radius: 12px;
  overflow: hidden;
  background-position: center;
  background-size: cover;
  color: #fff;
  font-family: '幼圆', 'YouYuan', '微软雅黑', sans-serif;
  font-size: clamp(18px, 1.5vw, 26px);
  font-weight: 900;
  letter-spacing: 2px;
  text-decoration: none;
  box-shadow: 0 8px 22px rgba(120, 88, 46, 0.18);
  transition: transform 0.18s ease;
}

.goods-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 35%, rgba(0, 0, 0, 0.55) 100%);
}

.goods-card span {
  position: relative;
  z-index: 1;
}

.goods-card:hover {
  transform: translateY(-3px);
}

.goods-personal {
  background-image: url('@/assets/img/人身装备.webp');
}

.goods-parts {
  background-image: url('@/assets/img/碟刹.png');
}

.goods-shifter {
  background-image: url('@/assets/img/前拨.png');
}

/* 1280 附近：三列会偏挤，把第一行压成 2 列 */
@media (max-width: 1280px) {
  .tools-grid {
    grid-template-columns: 1.6fr 1fr 1fr;
  }

  .shift-card span,
  .noise-card span {
    font-size: 13px;
  }
}
</style>
