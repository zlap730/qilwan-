<!--
  BikesView.vue —— 整车推荐（选车问卷）
  路由：/bikes

  顶部是选车主视觉；下面是 4 道问卷（路况 / 预算 / 需求 / 品牌），
  点「获取推荐」后从 73 款车里筛出匹配车型，并给出适用场景和核心配置；
  再往下是「大家买车前最担心的几件事」的 CSS 词云和买车建议。
  对应旧站：整车页面.HTML + JS文件/整车页面js.js（wordcloud2 词云已换成纯 CSS）。

  数据来源：@/data/bikes.json（73 款车）、@/assets/img/hq720.webp
-->
<script setup>
import { computed, reactive, ref } from 'vue'

import bikesData from '@/data/bikes.json'
import heroImage from '@/assets/img/hq720.webp'

/*
 * 整车推荐页：原 HTML/整车页面.HTML + JS文件/整车页面js.js
 * 原实现：fetch 本地 json + document.querySelector 取单选值 + innerHTML 拼结果 + wordcloud2.js 画词云。
 * 迁移后：JSON 直接 import（构建期就打包进来，不用再发请求）、单选绑定 v-model、
 *        过滤逻辑放 computed、词云改用纯 CSS 排版（少一个 CDN 依赖，也不会在窄屏溢出）。
 */

const bikes = bikesData.bikes

const answer = reactive({
  terrain: '',
  budget: '',
  needs: '',
  brand: ''
})

const submitted = ref(false)
const error = ref('')

// 与旧 JS 里的 ranges / descMap 保持一致
const budgetRanges = {
  2000: [0, 2000],
  5000: [2001, 5000],
  10000: [5001, 10000],
  max: [10001, Infinity]
}

const terrainDesc = {
  city: '城市道路',
  mountain: '山地越野',
  mixed: '混合路面',
  road: '公路竞速'
}

const questions = [
  {
    key: 'terrain',
    title: '1. 您的主要骑行路况是？',
    options: [
      { value: 'city', label: '城市平坦道路（通勤/休闲）' },
      { value: 'mountain', label: '山地/崎岖路面（越野、爬坡）' },
      { value: 'mixed', label: '混合路面（部分公路+部分碎石/土路）' },
      { value: 'road', label: '长距离公路骑行（竞速/耐力）' }
    ]
  },
  {
    key: 'budget',
    title: '2. 您的预算范围是？',
    options: [
      { value: '2000', label: '2000元以下（经济实用型）' },
      { value: '5000', label: '2000-5000元（性价比均衡型）' },
      { value: '10000', label: '5000-10000元（中高端性能型）' },
      { value: 'max', label: '10000元以上（专业/定制级）' }
    ]
  },
  {
    key: 'needs',
    title: '3. 您的核心需求是？',
    options: [
      { value: 'light', label: '轻便易携带' },
      { value: 'comfort', label: '高舒适性' },
      { value: 'durable', label: '耐用低维护' },
      { value: 'speed', label: '高速度性能' },
      { value: 'multi', label: '多功能性' }
    ]
  },
  {
    key: 'brand',
    title: '4. 您希望推荐的品牌类型是？',
    options: [
      { value: 'international', label: '国际大牌' },
      { value: 'domestic', label: '国产高性价比' },
      { value: 'any', label: '均可' }
    ]
  }
]

const results = computed(() => {
  if (!submitted.value) return []
  const { terrain, budget, needs, brand } = answer
  if (!terrain || !budget || !needs || !brand) return []

  const [min, max] = budgetRanges[budget]
  return bikes.filter(
    (bike) =>
      bike.type.includes(terrain) &&
      bike.price >= min &&
      bike.price <= max &&
      bike.needs.includes(needs) &&
      (brand === 'any' || bike.brand === brand)
  )
})

function submit() {
  const missing = Object.values(answer).some((value) => !value)
  if (missing) {
    error.value = '请完成全部 4 个选项的选择'
    submitted.value = false
    return
  }
  error.value = ''
  submitted.value = true
}

function reset() {
  answer.terrain = ''
  answer.budget = ''
  answer.needs = ''
  answer.brand = ''
  submitted.value = false
  error.value = ''
}

// 词云数据来自旧页面的内联脚本
const cloudWords = [
  { text: '网购买车没保障', weight: 80 },
  { text: '自己不会修', weight: 67 },
  { text: '还是选二手好？', weight: 64 },
  { text: '选全新整车好？', weight: 52 },
  { text: '网购售后如何', weight: 45 },
  { text: '这辆车适不适合自己', weight: 30 }
]

// 权重映射到字号（18~40px），颜色循环取几个暖色
const cloudStyles = cloudWords.map((word, index) => ({
  ...word,
  size: 18 + Math.round((word.weight / 80) * 22),
  color: ['#c0392b', '#b96a26', '#2a6f97', '#2e7d32', '#7b4fa8', '#c47a2c'][index % 6]
}))

const bikeTypes = [
  { label: '山地车', to: '/article/mountain-bike' },
  { label: '公路车', to: '/article/road-bike' },
  { label: '电助力', to: '/pending/电助力' },
  { label: '土坡车', to: '/pending/土坡车' },
  { label: '街攀车', to: '/pending/街攀车' },
  { label: 'TT车', to: '/pending/TT车' },
  { label: '场地车', to: '/pending/场地车' },
  { label: '死飞', to: '/pending/死飞' }
]
</script>

<template>
  <main class="page-bikes">
    <header class="hero">
      <img class="hero-img" :src="heroImage" alt="如何选择适合的自行车" />
      <div class="hero-text">
        <h1>如何选择适合的自行车</h1>
        <p>在买第一辆自行车前，通常先要想清楚：我想要一辆什么样的车？它是通勤工具，还是运动爱好？</p>
        <p>自行车的种类极其丰富，不同领域、不同用途差别很大。这一页从「预算」和「需求」两点展开。</p>
      </div>
    </header>

    <section class="types">
      <span class="types-label">自行车种类</span>
      <router-link v-for="item in bikeTypes" :key="item.label" :to="item.to" class="type-chip">
        {{ item.label }}
      </router-link>
    </section>

    <section class="block">
      <h2>问卷推荐调查</h2>
      <p class="hint">回答 4 个问题，从 {{ bikes.length }} 款车里筛出匹配的车型。</p>

      <form @submit.prevent="submit">
        <fieldset v-for="question in questions" :key="question.key" class="question">
          <legend>{{ question.title }}</legend>
          <label v-for="option in question.options" :key="option.value" class="option">
            <input v-model="answer[question.key]" type="radio" :name="question.key" :value="option.value" />
            <span>{{ option.label }}</span>
          </label>
        </fieldset>

        <p v-if="error" class="msg error">{{ error }}</p>

        <div class="actions">
          <button type="submit" class="btn primary">获取推荐</button>
          <button type="button" class="btn ghost" @click="reset">重填</button>
        </div>
      </form>

      <div v-if="submitted" class="result">
        <h3 v-if="results.length">为你推荐以下 {{ results.length }} 款车型：</h3>
        <h3 v-else>暂未找到完全匹配的车型</h3>

        <p v-if="!results.length" class="hint">建议放宽预算或品牌条件，也可以先自己上网搜搜看。</p>

        <article v-for="bike in results" :key="bike.name" class="bike">
          <h4>{{ bike.name }}<span class="price">¥{{ bike.price }}</span></h4>
          <p>适用场景：{{ bike.type.map((t) => terrainDesc[t]).join(' / ') }}</p>
          <p>核心配置：{{ bike.config }}</p>
        </article>
      </div>
    </section>

    <section class="block">
      <h2>大家买车前最担心的几件事</h2>
      <div class="cloud">
        <span
          v-for="word in cloudStyles"
          :key="word.text"
          class="cloud-word"
          :style="{ fontSize: `${word.size}px`, color: word.color }"
        >
          {{ word.text }}
        </span>
      </div>
      <p class="hint">
        这些问题都很正常，毕竟买车是件大事。如果你是新手，建议去实体店买：售后和保障更省心；
        老手可以网购，选择更多、价格更有优势；动手能力强的话，收二手自己改装也是性价比和个性化的选择。
      </p>
    </section>

    <section class="block tips">
      <h2>买车前的两条提醒</h2>
      <p>如果你打算买整车，可以直接联系所在地区的车店老板，试骑之后再决定。</p>
      <p>
        想系统了解选车知识，可以看这期视频：
        <a href="https://www.bilibili.com/video/BV1eW4y1e7HS/" target="_blank" rel="noopener">
          转载自 B 站 UP：掠影_Cycling
        </a>
        （旧站内嵌的是本地 mp4，新站改为外链，省掉 280MB 视频文件。）
      </p>
    </section>
  </main>
</template>

<style scoped>
.page-bikes {
  min-height: 100vh;
  padding: 84px 0 60px;
  background: linear-gradient(180deg, #f8fbff 0%, #fdf4e6 45%, #f9ead8 100%);
  box-sizing: border-box;
}

.hero,
.types,
.block {
  width: min(1100px, 92vw);
  margin: 0 auto;
}

.hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 380px);
  gap: clamp(16px, 2vw, 32px);
  align-items: center;
  padding: clamp(16px, 2vw, 28px);
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 12px 32px rgba(150, 115, 70, 0.12);
}

.hero-img {
  width: 100%;
  height: 100%;
  max-height: 260px;
  object-fit: cover;
  border-radius: 10px;
  order: 2;
}

.hero-text {
  order: 1;
}

.hero-text h1 {
  margin: 0 0 12px;
  font-family: '幼圆', 'YouYuan', '微软雅黑', sans-serif;
  font-size: clamp(22px, 2.2vw, 32px);
  letter-spacing: 1px;
  color: #33261a;
}

.hero-text p {
  margin: 0 0 10px;
  color: #5f4b36;
  font-size: clamp(14px, 1.05vw, 16px);
  line-height: 1.9;
}

.types {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 10px;
  margin-top: 18px;
  padding: 14px 16px;
  border-radius: 12px;
  background: rgba(250, 195, 113, 0.28);
}

.types-label {
  margin-right: 4px;
  color: #8a5a1f;
  font-size: 14px;
  font-weight: 800;
}

.type-chip {
  padding: 5px 14px;
  border-radius: 999px;
  background: #fff;
  color: #b96a26;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 2px 6px rgba(160, 110, 40, 0.12);
}

.type-chip:hover {
  background: #fdf1e0;
}

.block {
  margin-top: 22px;
  padding: clamp(18px, 2.2vw, 30px);
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 12px 32px rgba(150, 115, 70, 0.1);
}

.block h2 {
  margin: 0 0 8px;
  font-family: '幼圆', 'YouYuan', '微软雅黑', sans-serif;
  font-size: clamp(19px, 1.7vw, 26px);
  color: #33261a;
}

.hint {
  margin: 0 0 16px;
  color: #7a6248;
  font-size: 14px;
  line-height: 1.9;
}

.question {
  margin: 0 0 16px;
  padding: 14px 16px;
  border: 1px solid #f0e3d1;
  border-radius: 10px;
  background: #fffdf9;
}

.question legend {
  padding: 0 6px;
  color: #4a3b2c;
  font-size: 15px;
  font-weight: 800;
}

.option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  color: #4a3b2c;
  font-size: 14px;
  cursor: pointer;
}

.option input {
  accent-color: #e8863c;
}

.actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 10px 24px;
  border: 0;
  border-radius: 999px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.btn:hover {
  transform: translateY(-2px);
}

.primary {
  background: #e8863c;
  color: #fff;
}

.ghost {
  border: 2px solid #e8863c;
  background: transparent;
  color: #b96a26;
}

.msg {
  margin: 0 0 12px;
  font-size: 14px;
}

.error {
  color: #c0392b;
}

.result {
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px dashed #e6d7c2;
}

.result h3 {
  margin: 0 0 14px;
  font-size: clamp(16px, 1.3vw, 19px);
  color: #33261a;
}

.bike {
  padding: 12px 14px;
  margin-bottom: 10px;
  border-radius: 10px;
  background: #fdf7ee;
}

.bike h4 {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin: 0 0 6px;
  font-size: 15px;
  color: #33261a;
}

.price {
  color: #c0392b;
  font-size: 14px;
}

.bike p {
  margin: 0 0 4px;
  color: #6b5a45;
  font-size: 13px;
  line-height: 1.8;
}

.cloud {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 10px 22px;
  padding: 20px 10px;
  border-radius: 12px;
  background: linear-gradient(135deg, #fff8ec, #fdece0);
}

.cloud-word {
  font-family: '幼圆', 'YouYuan', '微软雅黑', sans-serif;
  font-weight: 900;
  line-height: 1.3;
  letter-spacing: 1px;
  transition: transform 0.2s ease;
}

.cloud-word:hover {
  transform: scale(1.08);
}

.tips p {
  margin: 0 0 10px;
  color: #4a3b2c;
  font-size: clamp(14px, 1.05vw, 16px);
  line-height: 1.9;
}

.tips a {
  color: #c47a2c;
  font-weight: 700;
}

/* 窄屏：主视觉改成上下排 */
@media (max-width: 900px) {
  .hero {
    grid-template-columns: 1fr;
  }

  .hero-img {
    order: 1;
    max-height: 200px;
  }

  .hero-text {
    order: 2;
  }
}
</style>
