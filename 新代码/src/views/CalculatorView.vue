<!--
  CalculatorView.vue —— 装配清单（计算器 + 参考内容）
  路由：/calculator

  页面分左右两块，两块都能单独折叠：
    左：30 多行的自行车配件清单表格（配件名 / 单价 / 数量 / 规格 / 备注），
        数据数组 + v-for 生成，合计用 computed 自动算，底部按钮按需 import xlsx 导出 Excel；
    右：CalcRefPanel「参考内容」，三个标签承接原来导航里的三项：
        车架参考（原车架推荐）/ 零件道具（原零件道具）/ 变速器参考（原变速器）。

  折叠规则：收起明细 → 参考面板占满整行；收起参考 → 表格占满整行；
            折叠状态记在 localStorage（qile.calculator.layout），刷新后保持。
  对应旧站：装配计算器.html + 表格计算器.js + 装配计算器.js。
-->
<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import downloadIcon from '@/assets/img/图标文件/download_111133.png'
import heroImage from '@/assets/img/晓风车架.png'
import CalcRefPanel from '@/components/CalcRefPanel.vue'
import '@/assets/legacy/装配计算器.css'

/*
 * 原实现：381 行 HTML 手写 30 多个 <tr>，每格 input 都靠 name/id + document.querySelector 回读，
 * 同一批 id（#单价 #数量 #规格 #备注）在页面里重复了几十次（HTML 里 id 必须唯一）。
 * 迁移后：一行数据 = 一个对象，表格用 v-for 渲染，合计用 computed 自动算。
 */
const templateRows = [
  { label: '车架品牌', placeholder: '必填' },
  { options: ['硬前叉', '避震前叉'], placeholder: '车架带可以不填' },
  { label: '后避震器', placeholder: '硬尾不填' },
  { gap: true },
  { label: '花鼓', optional: true, placeholder: '不需要的可以不填' },
  { label: '辐条', optional: true, placeholder: '不需要的可以不填' },
  { label: '外胎', placeholder: '选真空胎不填此空' },
  { label: '内胎/真空胎+自补液', placeholder: '必填' },
  { options: ['成品轮组', '轮圈'], placeholder: '必填' },
  { gap: true },
  { label: '前拨' },
  { label: '后拨' },
  { options: ['手变头', '指拨变速器'] },
  { label: '飞轮' },
  { label: '中轴' },
  { label: '牙盘' },
  { label: '链条' },
  { label: '线管/线芯' },
  { gap: true },
  { options: ['夹器', '碟刹'], placeholder: '注意规格' },
  { label: '碟片', placeholder: '圈刹跳过' },
  { options: ['线管', '油管'] },
  { label: '刹车油/线芯', optional: true },
  { gap: true },
  { label: '座管夹' },
  { label: '车把' },
  { label: '把立' },
  { label: '坐管' },
  { label: '坐垫' },
  { label: '把带' },
  { label: '碗组' }
]

const rows = ref(
  templateRows.map((row, index) => ({
    id: index,
    gap: Boolean(row.gap),
    label: row.label || '',
    options: row.options || null,
    placeholder: row.placeholder || '',
    optional: Boolean(row.optional),
    choice: row.options ? row.options[0] : '',
    part: '',
    price: null,
    qty: 1,
    spec: '',
    remark: ''
  }))
)

const dataRows = computed(() => rows.value.filter((row) => !row.gap))

const total = computed(() =>
  dataRows.value.reduce((sum, row) => sum + (Number(row.price) || 0) * (Number(row.qty) || 0), 0)
)

const itemCount = computed(() =>
  dataRows.value
    .filter((row) => row.part)
    .reduce((sum, row) => sum + (Number(row.qty) || 0), 0)
)

const filledCount = computed(() => dataRows.value.filter((row) => row.part).length)

/*
 * 可折叠：
 *  - 底部「填写明细」独立折叠，收起后只看合计，把纵向空间让给右侧参考；
 *  - 从表格顶部点「收起」，右侧参考面板会展开到表格上方占满整行；
 *  - 折叠状态记在 localStorage，下次进来保持上次的样子。
 */
const { t } = useI18n()

const STORAGE_KEY = 'qile.calculator.layout'

function readLayout() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

const saved = readLayout()
const detailOpen = ref(saved.detailOpen !== false) // 明细默认展开
const refOpen = ref(saved.refOpen !== false) // 参考面板默认展开

function saveLayout() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ detailOpen: detailOpen.value, refOpen: refOpen.value })
    )
  } catch {
    /* 隐私模式下 localStorage 可能不可写，忽略即可 */
  }
}

function toggleDetail() {
  detailOpen.value = !detailOpen.value
  saveLayout()
}

function toggleRef() {
  refOpen.value = !refOpen.value
  saveLayout()
}

const notice = ref('')
let noticeTimer
function flash(message) {
  notice.value = message
  clearTimeout(noticeTimer)
  noticeTimer = setTimeout(() => {
    notice.value = ''
  }, 2400)
}

function labelOf(row) {
  return row.label || row.choice
}

// 原来要引一份 400KB 的 xlsx CDN 脚本，现在按需动态 import，只有点下载才会加载
async function exportXlsx() {
  if (!dataRows.value.some((row) => row.part || row.price)) {
    flash('请先填写至少一项配件')
    return
  }
  if (!window.confirm('是否确定下载表格？')) return

  const XLSX = await import('xlsx')
  const header = ['配置清单', '配件名称', '单价', '数量', '规格', '备注', '小计']
  const body = dataRows.value.map((row) => {
    const price = Number(row.price) || 0
    const qty = Number(row.qty) || 0
    return [labelOf(row), row.part, price, qty, row.spec, row.remark, price * qty]
  })
  body.push(['合计', '', '', '', '', '', total.value])

  const sheet = XLSX.utils.aoa_to_sheet([header, ...body])
  const book = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(book, sheet, '装配清单')
  XLSX.writeFile(book, '装配清单.xlsx')
  flash('已生成 装配清单.xlsx')
}
</script>

<template>
  <main class="page-calculator">
    <section class="intro">
      <div class="intro-text">
        <p>{{ t('calculator.intro1') }}</p>
        <p>{{ t('calculator.intro2') }}</p>
        <p>{{ t('calculator.intro3') }}</p>
      </div>
      <img class="intro-img" :src="heroImage" alt="车架" />
    </section>

    <section class="sheet">
      <!-- 工具条：折叠开关 + 合计速览（收起明细后也能看到总价） -->
      <div class="sheet-bar">
        <div class="bar-left">
          <button type="button" class="fold-btn" @click="toggleDetail">
            <span class="caret" :class="{ open: detailOpen }">▾</span>
            {{ detailOpen ? t('calculator.hideDetail') : t('calculator.showDetail') }}
          </button>
          <button type="button" class="fold-btn" @click="toggleRef">
            <span class="caret" :class="{ open: refOpen }">▾</span>
            {{ refOpen ? t('calculator.hideRef') : t('calculator.showRef') }}
          </button>
        </div>
        <div class="bar-right">
          <span class="sum">{{ t('calculator.sum') }} <b>¥{{ total.toFixed(2) }}</b></span>
          <span class="sum-weak">{{ itemCount }} 件 · 已填 {{ filledCount }} 项</span>
        </div>
      </div>

      <!-- 主体：表格 + 参考面板。参考收起时表格占满，表格收起时参考占满 -->
      <div
        class="sheet-body"
        :class="{ 'detail-closed': !detailOpen, 'ref-closed': !refOpen, 'both-closed': !detailOpen && !refOpen }"
      >
        <div v-if="detailOpen" class="table-col">
          <div id="nav_table">
            <ul>
              <li>{{ t('calculator.colLabel') }}</li>
              <li>{{ t('calculator.colPart') }}</li>
              <li>{{ t('calculator.colPrice') }}</li>
              <li>{{ t('calculator.colQty') }}</li>
              <li>{{ t('calculator.colSpec') }}</li>
              <li>{{ t('calculator.colRemark') }}</li>
            </ul>
          </div>

          <div id="div_table">
            <form @submit.prevent>
              <table id="table" border="1">
                <!-- PC 自适应：用 colgroup 按百分比分配列宽，替代原来每格写死 px 的做法 -->
                <colgroup>
                  <col class="c-label" />
                  <col class="c-part" />
                  <col class="c-price" />
                  <col class="c-qty" />
                  <col class="c-spec" />
                  <col class="c-remark" />
                </colgroup>
                <tbody>
                  <template v-for="row in rows" :key="row.id">
                    <tr v-if="row.gap" class="item-row gap-row">
                      <td colspan="6" />
                    </tr>

                    <tr v-else class="item-row">
                      <td>
                        <select v-if="row.options" v-model="row.choice" class="config-select">
                          <option v-for="option in row.options" :key="option" :value="option">
                            {{ option }}
                          </option>
                        </select>
                        <template v-else>
                          {{ row.label }}<span v-if="row.optional">(选填)</span>
                        </template>
                      </td>

                      <td>
                        <input v-model="row.part" type="text" class="col-part" :placeholder="row.placeholder" />
                      </td>
                      <td>
                        <input v-model.number="row.price" type="number" min="0" step="0.01" class="col-price" />
                      </td>
                      <td>
                        <input v-model.number="row.qty" type="number" min="0" class="col-qty" />
                      </td>
                      <td>
                        <input v-model="row.spec" type="text" class="col-spec" />
                      </td>
                      <td>
                        <input v-model="row.remark" type="text" class="col-remark" />
                      </td>
                    </tr>
                  </template>

                  <tr class="item-row total-row">
                    <td>{{ t('calculator.total') }}</td>
                    <td>
                      <input id="jsjs" type="text" :value="`¥${total.toFixed(2)}`" readonly />
                    </td>
                    <td>
                      <input id="numnum" type="text" :value="`${itemCount} 件`" readonly />
                    </td>
                    <td colspan="3" class="auto-tip">
                      {{ t('calculator.filled', { n: filledCount }) }}
                    </td>
                  </tr>
                </tbody>

                <tfoot>
                  <tr>
                    <td colspan="6">{{ t('calculator.footnote') }}</td>
                  </tr>
                </tfoot>
              </table>
            </form>
          </div>

          <p id="table_P">{{ t('calculator.downloadTip') }}</p>

          <div class="export">
            <label for="exportButton">
              <img :src="downloadIcon" alt="下载图标" />
            </label>
            <input id="exportButton" type="button" :value="t('calculator.download')" @click="exportXlsx" />
          </div>
        </div>

        <!-- 明细收起后的提示条 -->
        <div v-if="!detailOpen" class="collapsed-hint">
          <p>填写明细已收起，合计 ¥{{ total.toFixed(2) }}（{{ itemCount }} 件）。</p>
          <button type="button" class="fold-btn" @click="toggleDetail">展开明细继续填写</button>
        </div>

        <!-- 右侧参考：车架 / 零件道具 / 变速器 -->
        <CalcRefPanel v-if="refOpen" class="ref-col" />
      </div>
    </section>

    <transition name="toast">
      <p v-if="notice" class="toast">{{ notice }}</p>
    </transition>
  </main>
</template>

<style scoped>
.page-calculator {
  min-height: 100vh;
  padding: 70px 0 40px;
}

.intro {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: clamp(16px, 2vw, 30px);
  width: min(1180px, 92vw);
  margin: 0 auto 30px;
  padding: 24px clamp(16px, 2vw, 30px);
  border-radius: 8px;
  background-color: bisque;
  box-sizing: border-box;
}

.intro-text {
  flex: 1 1 420px;
  min-width: 0;
}

.intro-text p {
  margin: 0 0 12px;
  font-family: serif;
  font-size: clamp(16px, 1.25vw, 20px);
  font-weight: 700;
  line-height: 1.8;
}

.intro-img {
  flex: 0 1 260px;
  width: min(260px, 34vw);
  border-radius: 15px;
}

.sheet {
  width: min(1560px, 96vw);
  margin: 0 auto;
  padding-bottom: 40px;
  background-image: linear-gradient(0deg, #fff, bisque);
  border-radius: 8px;
}

/* ── 工具条：折叠按钮 + 合计速览 ── */
.sheet-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  padding: 12px 14px;
}

.bar-left,
.bar-right {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.fold-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border: 1px solid #e8c9a6;
  border-radius: 999px;
  background: #fffdf9;
  color: #b96a26;
  font-family: inherit;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.fold-btn:hover {
  background: #fdf1e0;
}

.fold-btn .caret {
  display: inline-block;
  transition: transform 0.2s ease;
  transform: rotate(-90deg);
}

.fold-btn .caret.open {
  transform: rotate(0deg);
}

.sum {
  color: #4a3b2c;
  font-size: 14px;
}

.sum b {
  margin-left: 4px;
  color: #c0392b;
  font-size: 18px;
}

.sum-weak {
  color: #8a7761;
  font-size: 12px;
}

/* ── 主体：左边表格 / 右边参考，两边都能单独折叠 ── */
.sheet-body {
  display: grid;
  grid-template-columns: minmax(0, 1.62fr) minmax(340px, 1fr);
  gap: 14px;
  padding: 0 14px;
  align-items: start;
}

/* 参考收起：表格占满整行 */
.sheet-body.ref-closed {
  grid-template-columns: minmax(0, 1fr);
}

/* 明细收起：参考面板占满整行（这时表格区域只剩一条提示条） */
.sheet-body.detail-closed {
  grid-template-columns: minmax(0, 1fr);
}

.table-col {
  min-width: 0;
}

.ref-col {
  /* 让参考面板跟着视线固定在表格旁边，滚动填表时也能参考 */
  position: sticky;
  top: 76px;
  max-height: calc(100vh - 110px);
  display: flex;
}

.collapsed-hint {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding: 18px 16px;
  margin-bottom: 4px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px dashed #e6d7c2;
}

.collapsed-hint p {
  margin: 0;
  color: #4a3b2c;
  font-size: 15px;
  font-weight: 700;
}

/* 窄屏：参考面板落到表格下面，不吸顶 */
@media (max-width: 1280px) {
  .sheet-body {
    grid-template-columns: minmax(0, 1fr);
  }

  .ref-col {
    position: static;
    max-height: 520px;
  }
}

/* 原来 6 个 li 靠 left/right 手调像素对齐，这里改成和表格列同宽的 grid，
   这样表头文字正好落在对应列上（原来是 space-around，宽屏下会错位） */
#nav_table {
  width: 100%;
  height: auto;
  min-height: 50px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}

#nav_table ul {
  display: grid;
  grid-template-columns: 16% 27% 14% 10% 16.5% 16.5%;
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
}

#nav_table ul li {
  display: flex;
  align-items: center;
  justify-content: center;
  right: auto;
  left: auto;
  margin-left: 0;
  height: 100%;
  font-size: clamp(15px, 1.3vw, 22px);
  line-height: 1.5;
  text-align: center;
  /* 原样式是白字 + 四向 1px 黑描边，字小时描边会糊成一条横线，改成清晰的黑字 */
  color: #2b2b2b;
  text-shadow: none;
}

/* ── 表格改为流体：宽度跟着 .sheet 走，列宽由 colgroup 按百分比分配 ── */
#div_table,
#nav_table,
#div_table form table {
  width: 100%;
  height: auto;
  box-sizing: border-box;
}

#div_table form table {
  table-layout: fixed;
}

#table .c-label {
  width: 16%;
}

#table .c-part {
  width: 27%;
}

#table .c-price {
  width: 14%;
}

#table .c-qty {
  width: 10%;
}

#table .c-spec {
  width: 16.5%;
}

#table .c-remark {
  width: 16.5%;
}

#table td {
  padding: 5px 6px;
  font-size: clamp(15px, 1.15vw, 20px);
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 输入框铺满单元格，不再写死 240/120/80px */
.col-part,
.col-price,
.col-qty,
.col-spec,
.col-remark {
  width: 100%;
  box-sizing: border-box;
}

/* 下拉框原来写死 200px，窄屏时会顶破单元格 */
#table select {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.gap-row td {
  height: 25px;
}

.total-row td {
  font-size: clamp(15px, 1.1vw, 19px);
}

.auto-tip {
  color: #7a6248;
  font-size: clamp(12px, 0.95vw, 14px);
  line-height: 1.5;
}

.export {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding-top: 20px;
}

/* 原样式给 label 里的图片写死了 left:650px / top:21px，这里归零交给 flex 布局 */
.export label,
.export label img {
  position: static;
  left: 0;
  top: 0;
}

.export img {
  width: 50px;
  height: 50px;
  transition: transform 0.2s ease;
}

.export img:hover {
  transform: scale(1.1);
}

#exportButton {
  position: static;
  width: min(300px, 60vw);
  height: 40px;
  border-radius: 20px;
  font-family: '等线';
  font-size: clamp(16px, 1.3vw, 20px);
  letter-spacing: 1px;
  cursor: pointer;
}

#table_P {
  position: static;
  writing-mode: horizontal-tb;
  width: auto;
  margin: 18px 0 0;
  padding-left: clamp(16px, 3vw, 40px);
  font-size: clamp(14px, 1.15vw, 18px);
  letter-spacing: 1px;
}

.toast {
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  padding: 10px 22px;
  border-radius: 999px;
  background: rgba(40, 40, 40, 0.88);
  color: #fff;
  font-size: 14px;
  z-index: 100000;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
}

/* 1280 左右：表格 6 列会比较挤，收紧内边距和字号 */
@media (max-width: 1440px) {
  #table td {
    padding: 4px 4px;
    font-size: 14.5px;
  }

  #table input {
    font-size: 13.5px;
  }
}
</style>
