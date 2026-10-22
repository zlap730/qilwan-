<script setup>
import { computed, ref } from 'vue'

import downloadIcon from '@/assets/img/图标文件/download_111133.png'
import heroImage from '@/assets/img/晓风车架.png'
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
        <p>我致力于为那些喜欢自己组装自行车的朋友提供便利，让你可以线上直接列出组装车所需的清单。</p>
        <p>填完下表即可实时得到预算合计，并可一键导出 Excel 交给车店报价。</p>
        <p>如果您希望为自己的爱车量身定制独特配置，我们也很乐意为您提供专业建议和支持。</p>
      </div>
      <img class="intro-img" :src="heroImage" alt="车架" />
    </section>

    <section class="sheet">
      <div id="nav_table">
        <ul>
          <li>配置清单</li>
          <li>物品</li>
          <li>单价</li>
          <li>数量</li>
          <li>配件规格</li>
          <li>备注</li>
        </ul>
      </div>

      <div id="div_table">
        <form @submit.prevent>
          <table id="table" border="1">
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
                <td>总计预算：</td>
                <td>
                  <input id="jsjs" type="text" :value="`¥${total.toFixed(2)}`" readonly />
                </td>
                <td>
                  <input id="numnum" type="text" :value="`${itemCount} 件`" readonly />
                </td>
                <td colspan="3" class="auto-tip">
                  已填 {{ filledCount }} 项 · 单价/数量一改，合计自动重算（原来的「点击计算最终结果」按钮可以退休了）
                </td>
              </tr>
            </tbody>

            <tfoot>
              <tr>
                <td colspan="6">在填写的过程中请您确认好填写配件中的规格大小，以防出现配件之间规格不兼容的问题</td>
              </tr>
            </tfoot>
          </table>
        </form>
      </div>

      <p id="table_P">填写此表格后可以点击下载将表格下载到本地中 | 下载不收费</p>

      <div class="export">
        <label for="exportButton">
          <img :src="downloadIcon" alt="下载图标" />
        </label>
        <input id="exportButton" type="button" value="点击下载表格" @click="exportXlsx" />
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
  overflow-x: hidden;
}

.intro {
  display: flex;
  align-items: center;
  gap: 30px;
  width: min(1500px, 94vw);
  margin: 0 auto 30px;
  padding: 24px 30px;
  border-radius: 8px;
  background-color: bisque;
}

.intro-text p {
  margin: 0 0 12px;
  font-family: serif;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.8;
}

.intro-img {
  flex: 0 0 260px;
  width: 260px;
  border-radius: 15px;
}

.sheet {
  width: min(1600px, 96vw);
  margin: 0 auto;
  padding-bottom: 40px;
  background-image: linear-gradient(0deg, #fff, bisque);
  border-radius: 8px;
}

/* 原来 6 个 li 靠 left/right 手调像素对齐，这里改成 flex 均分 */
#nav_table ul {
  display: flex;
  justify-content: space-around;
  margin: 0;
  padding: 0;
  list-style: none;
}

#nav_table ul li {
  right: auto;
  left: auto;
  margin-left: 0;
}

.col-part {
  width: 240px;
}

.col-price {
  width: 120px;
}

.col-qty {
  width: 80px;
}

.col-spec {
  width: 200px;
}

.col-remark {
  width: 200px;
}

.gap-row td {
  height: 25px;
}

.total-row td {
  font-size: 19px;
}

.auto-tip {
  color: #7a6248;
  font-size: 14px;
}

.export {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding-top: 20px;
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
  width: 300px;
  height: 40px;
  border-radius: 20px;
  font-family: '等线';
  font-size: 20px;
  letter-spacing: 1px;
  cursor: pointer;
}

#table_P {
  position: static;
  writing-mode: horizontal-tb;
  width: auto;
  margin: 18px 0 0;
  padding-left: 40px;
  font-size: 18px;
  letter-spacing: 2px;
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

/* 原样式把表格写死 1200px，窄屏会横向溢出 */
@media (max-width: 1280px) {
  #div_table,
  #nav_table,
  #div_table form table {
    width: 100%;
  }

  .col-part {
    width: 150px;
  }

  .col-spec,
  .col-remark {
    width: 130px;
  }
}
</style>
