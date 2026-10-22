<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

import bike00 from '@/assets/img/00.jpg'
import bikeAM from '@/assets/img/AM山地车.jpg'
import bikeRoad from '@/assets/img/2公路车图片.jpg'
import { brandContents } from '@/data/shifterBrands'
import { brandCsvMap, shifterCategories } from '@/data/shifterMeta'
import '@/assets/legacy/变速器大全.css'

/*
 * 原实现（变速器大全-选项框.js，1058 行）：
 *   - selectCategory() 用 innerHTML 拼品牌卡，再回头 querySelector('.brand[onclick*="蓝图"]') 找回来点一下；
 *   - selectBrand() 用 innerHTML 注入品牌正文，再 setTimeout(10) 加 .show 做淡入；
 *   - 品牌正文 900 多行 HTML 全塞在 getBrandContent() 里；
 *   - loadCSV() 写进一个页面上根本不存在的 #table-container（死代码）。
 * 迁移后：状态 = 两个 ref；正文 = 抽出来的 data 模块；淡入/淡出/CSV 都是显式逻辑。
 */

const activeCategoryId = ref(shifterCategories[0].id)
const activeBrandId = ref(shifterCategories[0].brands[0].id)
const panelRef = ref(null)
const containerRef = ref(null)
const csvRows = ref([])

const activeCategory = computed(
  () => shifterCategories.find((item) => item.id === activeCategoryId.value) || shifterCategories[0]
)
const activeBrand = computed(
  () => activeCategory.value.brands.find((item) => item.id === activeBrandId.value) || activeCategory.value.brands[0]
)

const brandHtml = computed(() => brandContents[activeBrandId.value] || '<p>未找到相关内容。</p>')
const csvHeader = computed(() => csvRows.value[0] || [])
const csvBody = computed(() => csvRows.value.slice(1))

/* 页头那排来回滚动的图片：对应原页面 inline script 里的 rAF 动画（第 4 张 src 是空的，这里去掉） */
const sliderImages = ref([
  { src: bikeRoad, width: 120, top: 50, left: 100 },
  { src: bike00, width: 150, top: 150, left: 300 },
  { src: bikeAM, width: 100, top: 250, left: 500 }
])

const SPEED = 80 // 像素/秒，与原代码一致
let rafId = 0
let lastFrame = 0

function animate(now) {
  const containerWidth = containerRef.value?.offsetWidth || 800
  const delta = (now - lastFrame) / 1000
  lastFrame = now

  for (const image of sliderImages.value) {
    let next = image.left + SPEED * delta
    if (next > containerWidth) next = -image.width
    image.left = next
  }

  rafId = requestAnimationFrame(animate)
}

/* 切换品牌时保留原来的淡入：给 .brand-content 加 .show（原来靠 setTimeout 10ms） */
async function playFadeIn() {
  await nextTick()
  const panel = panelRef.value?.querySelector('.brand-content')
  if (!panel) return
  panel.classList.remove('show')
  requestAnimationFrame(() => panel.classList.add('show'))
}

function parseCsv(text) {
  return text
    .replace(/\r/g, '')
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => line.split(','))
}

async function loadBrandCsv(brandId) {
  csvRows.value = []
  const url = brandCsvMap[brandId]
  if (!url) return

  try {
    const response = await fetch(encodeURI(url))
    if (!response.ok) return // 文件不存在就安静跳过（原代码这里只会 console.error，页面上什么都看不到）
    const text = await response.text()
    // 注意：SPA 的 fallback 会把不存在的路径返回成 index.html（200 + HTML），
    // 所以不能只看 response.ok，还得确认拿到的确实是 CSV 而不是首页 HTML。
    if (text.trimStart().startsWith('<')) return
    csvRows.value = parseCsv(text)
  } catch {
    csvRows.value = []
  }
}

/* 与原来一致：点分类后默认选中该类第一个品牌 */
function selectCategory(category) {
  activeCategoryId.value = category.id
  selectBrand(category.brands[0])
}

function selectBrand(brand) {
  activeBrandId.value = brand.id
  playFadeIn()
  loadBrandCsv(brand.id)
}

onMounted(() => {
  lastFrame = performance.now()
  rafId = requestAnimationFrame(animate)
  loadBrandCsv(activeBrandId.value)
  // 原页面靠 <body onload="defaultDisplay()"> 来完成首次选中 + 淡入；
  // 这里首屏也要补一次，否则 .brand-content 停在 opacity:0 上，进来是空白。
  playFadeIn()
})

onBeforeUnmount(() => cancelAnimationFrame(rafId))
</script>

<template>
  <main class="page-shifter">
    <header id="header1">
      <div ref="containerRef" class="container">
        <img
          v-for="image in sliderImages"
          :key="image.src"
          class="sliding-image"
          :src="image.src"
          :style="{ width: `${image.width}px`, top: `${image.top}px`, left: `${image.left}px` }"
          alt=""
        />
      </div>

      <div id="head">
        <h2>相关变速器产品目录</h2>
        <p>如果你需要选购自行车变速套件的话，可以参考以下内容</p>
        <p>这里我们结合了市面上所有国内包括国外的知名变速品牌</p>
        <p>希望能帮助到你选到时候你自己的变速器套件</p>
      </div>

      <div class="options-wrap">
        <div id="options-container">
          <div id="options">
            <div
              v-for="category in shifterCategories"
              :key="category.id"
              class="category"
              :class="{ selected: category.id === activeCategoryId }"
              @click="selectCategory(category)"
            >
              <h2>{{ category.label }}</h2>
            </div>
          </div>
        </div>

        <div id="content">
          <div class="brand-options">
            <div
              v-for="brand in activeCategory.brands"
              :key="brand.id"
              class="brand"
              :class="{ selected: brand.id === activeBrandId, bsq: activeCategory.id === 'imported' }"
              @click="selectBrand(brand)"
            >
              {{ brand.label }}
            </div>
          </div>

          <!-- 品牌正文：仍然是原来的 HTML（由 scripts/extract-shifter-data.mjs 从老 JS 原样抽出），
               交互交给 Vue 管理，内容一行没改 -->
          <div ref="panelRef" v-html="brandHtml" />

          <!-- 原来 loadCSV() 写的就是这个 id，但页面上没有这个元素，所以从来没显示过 -->
          <div v-if="csvBody.length" id="table-container" class="series-section">
            <h2>{{ activeBrand.label }} 详细参数（CSV）</h2>
            <table>
              <thead>
                <tr>
                  <th v-for="(header, index) in csvHeader" :key="index">{{ header }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, rowIndex) in csvBody" :key="rowIndex">
                  <td v-for="(cell, cellIndex) in row" :key="cellIndex">{{ cell }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <p class="migrate-note">
        本页文案与价格表与原版逐字一致；数据结构见 <code>src/data/shifterBrands.js</code>，
        改样式请改 <code>src/assets/legacy/变速器大全.css</code>（原 <code>旧代码/css文档/变速器大全.css</code> 的迁移版）。
      </p>
    </header>
  </main>
</template>

<style scoped>
.page-shifter {
  min-height: 100vh;
  padding-top: 60px;
  box-sizing: border-box;
}

/* 原来这层样式写在行内：opacity .9 + bisque + width 80% + 固定 1600px 高。
   PC 自适应：宽度改成「最大 1400px + 92vw」，2560 屏上不会被拉成 2000px 的一条。 */
#header1 {
  width: min(1400px, 92vw);
  min-height: 1100px;
  margin: 0 auto;
  padding-bottom: 40px;
  background-color: bisque;
  opacity: 0.9;
  box-sizing: border-box;
}

/* 页头那排滚动图片的容器：原来是写死的 800×400，这里改成随屏宽收缩并居中 */
.container {
  width: min(800px, 100%);
  height: auto;
  aspect-ratio: 2 / 1;
  max-height: 400px;
  margin: 0 auto;
}

#head h2 {
  margin: 0 0 16px;
  padding-top: 20px;
  text-align: center;
  font-size: clamp(20px, 1.6vw, 26px);
}

#head p {
  margin-left: clamp(8px, 3vw, 50px);
  font-size: clamp(14px, 1.1vw, 18px);
}

.options-wrap {
  width: 100%;
}

/* 原 CSS 里是 display:none，靠 JS 打开；Vue 里常驻显示 */
#content {
  display: block;
  width: min(1180px, 94%);
  height: auto;
  max-height: 72vh;
}

/* 品牌卡：原来是 18% / 31% 的固定百分比，现在用 flex 自适应并限宽 */
.brand-options {
  display: flex;
  flex-wrap: wrap;
  gap: clamp(8px, 1vw, 18px);
  justify-content: center;
}

.brand,
.bsq {
  width: auto;
  flex: 1 1 140px;
  max-width: 240px;
  box-sizing: border-box;
}

#table-container {
  margin-top: 30px;
}

#table-container table {
  width: 100%;
  border-collapse: collapse;
  background-color: rgb(255, 184, 96);
}

.migrate-note {
  width: min(1180px, 90%);
  margin: 10px auto 0;
  color: #4a3b2a;
  font-size: 13px;
  line-height: 1.8;
}

.migrate-note code {
  padding: 1px 5px;
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.08);
  font-size: 12px;
}
</style>

<style>
/* 这一段作用在 v-html 渲染出来的内容上，所以不能用 scoped */
.todo-link {
  color: #a35;
  text-decoration: underline dotted;
  cursor: help;
}

#header1 .brand-content {
  transition: opacity 0.3s ease-in-out;
}

/* PC 自适应：品牌正文是 v-html 渲染的，只能在全局样式里约束，
   防止宽表格 / 大图把容器顶破 */
#header1 table {
  max-width: 100%;
}

#header1 img {
  max-width: 100%;
  height: auto;
}

#header1 .brand-content p,
#header1 .brand-content li {
  line-height: 1.8;
}
</style>
