<!--
  CalcRefPanel.vue —— 计算清单右侧「参考内容」面板
  被 CalculatorView.vue 使用（放在表格右边，可折叠收起给表格腾地方）

  三个标签，正好承接原来导航栏里的三项：
    车架参考   ← 原「车架推荐」
    零件道具   ← 原「零件道具」
    变速器参考 ← 原「变速器」

  数据全部来自 @/data/calculatorRefs.js（变速器表格由脚本从旧站资料自动抽取）。
  表格用 <table> 自己画，列宽交给浏览器按内容自适应，长文字自动换行，不会横向溢出。
-->
<script setup>
import { computed, ref } from 'vue'

import { frameRefs, partRefs, shifterEmptyBrands, shifterRefs } from '@/data/calculatorRefs'

const TABS = [
  { key: 'frame', label: '车架参考' },
  { key: 'part', label: '零件道具' },
  { key: 'shifter', label: '变速器参考' }
]

const tab = ref('frame')

// 每个标签里可选的「分组」（车架：材质 / 类型 / 规格；零件：速查 / 常见坑；变速器：品牌）
const activeGroup = ref(0)
// 变速器标签里再细分：国产 / 进口
const shifterOrigin = ref('国产')

const groups = computed(() => {
  if (tab.value === 'frame') return frameRefs
  if (tab.value === 'part') return partRefs
  return shifterRefs
    .filter((brand) => brand.origin === shifterOrigin.value)
    .map((brand) => ({
      name: brand.label,
      intro: `${brand.tables.length} 张表`,
      isShifter: true,
      tables: brand.tables
    }))
})

// 切换标签后分组要重置，否则可能指向不存在的下标
function switchTab(key) {
  tab.value = key
  activeGroup.value = 0
}

const currentGroup = computed(() => groups.value[activeGroup.value] || groups.value[0] || null)
</script>

<template>
  <aside class="ref-panel">
    <div class="ref-tabs">
      <button
        v-for="item in TABS"
        :key="item.key"
        type="button"
        class="ref-tab"
        :class="{ active: tab === item.key }"
        @click="switchTab(item.key)"
      >
        {{ item.label }}
      </button>
    </div>

    <!-- 变速器标签：先分国产 / 进口 -->
    <div v-if="tab === 'shifter'" class="origin-switch">
      <button
        v-for="origin in ['国产', '进口']"
        :key="origin"
        type="button"
        class="origin-btn"
        :class="{ active: shifterOrigin === origin }"
        @click="shifterOrigin = origin; activeGroup = 0"
      >
        {{ origin }}
      </button>
    </div>

    <div class="ref-body">
      <!-- 分组切换 -->
      <div class="group-chips">
        <button
          v-for="(group, index) in groups"
          :key="group.name"
          type="button"
          class="chip"
          :class="{ active: index === activeGroup }"
          @click="activeGroup = index"
        >
          {{ group.name }}
        </button>
      </div>

      <template v-if="currentGroup">
        <p v-if="currentGroup.intro" class="group-intro">{{ currentGroup.intro }}</p>

        <!-- 普通的两类：一个分组就是一张表 -->
        <table v-if="!currentGroup.isShifter" class="ref-table">
          <thead>
            <tr>
              <th v-for="(head, i) in currentGroup.head" :key="i">{{ head }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, r) in currentGroup.rows" :key="r">
              <td v-for="(cell, c) in row" :key="c">{{ cell }}</td>
            </tr>
          </tbody>
        </table>

        <!-- 变速器：一个品牌可能有多张表 -->
        <template v-else>
          <div v-for="(table, t) in currentGroup.tables" :key="t" class="shifter-table">
            <h4 v-if="table.title">{{ table.title }}</h4>
            <table class="ref-table">
              <thead>
                <tr>
                  <th v-for="(head, i) in table.head" :key="i">{{ head }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, r) in table.rows" :key="r">
                  <td v-for="(cell, c) in row" :key="c">{{ cell }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </template>

      <p v-else class="empty">这一组暂时没有资料。</p>

      <p v-if="tab === 'shifter'" class="footnote">
        速联 SRAM 与 Campagnolo 在旧站里就没有整理表格，这里暂缺。
        （{{ shifterEmptyBrands.join('、') }}）
      </p>
    </div>
  </aside>
</template>

<style scoped>
.ref-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-radius: 10px;
  background: #fffdf9;
  border: 1px solid #efe2cd;
  box-shadow: 0 8px 22px rgba(150, 115, 70, 0.1);
  overflow: hidden;
}

.ref-tabs {
  display: flex;
  flex: 0 0 auto;
  border-bottom: 1px solid #efe2cd;
}

.ref-tab {
  flex: 1 1 0;
  padding: 10px 6px;
  border: 0;
  background: #f8efe1;
  color: #7a6248;
  font-family: inherit;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.ref-tab + .ref-tab {
  border-left: 1px solid #efe2cd;
}

.ref-tab.active {
  background: #fffdf9;
  color: #c45d16;
}

.origin-switch {
  display: flex;
  gap: 8px;
  padding: 8px 10px 0;
}

.origin-btn {
  flex: 0 0 auto;
  padding: 4px 14px;
  border: 1px solid #e8d4b6;
  border-radius: 999px;
  background: #fff;
  color: #7a6248;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.origin-btn.active {
  border-color: #e8863c;
  background: #e8863c;
  color: #fff;
}

.ref-body {
  flex: 1 1 auto;
  min-height: 0;
  padding: 10px;
  overflow: auto;
}

.group-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.chip {
  padding: 4px 12px;
  border: 1px solid #eeDfc8;
  border-radius: 999px;
  background: #fff;
  color: #8a6a45;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.chip.active {
  border-color: #e8863c;
  background: #fdeee0;
  color: #c45d16;
}

.group-intro {
  margin: 0 0 8px;
  color: #8a7761;
  font-size: 12px;
  line-height: 1.7;
}

.ref-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  line-height: 1.6;
  table-layout: auto;
}

.ref-table th,
.ref-table td {
  padding: 5px 6px;
  border: 1px solid #eee2cf;
  text-align: left;
  vertical-align: top;
  /* 长文字（比如价格说明）自动换行，不撑破面板 */
  word-break: break-word;
  overflow-wrap: anywhere;
}

.ref-table th {
  background: #f8efe1;
  color: #5a4630;
  font-weight: 800;
  white-space: nowrap;
}

.ref-table tbody tr:nth-child(even) td {
  background: #fdfaf5;
}

.ref-table td:first-child {
  color: #33261a;
  font-weight: 700;
}

.shifter-table + .shifter-table {
  margin-top: 12px;
}

.shifter-table h4 {
  margin: 0 0 6px;
  color: #b4632a;
  font-size: 13px;
  font-weight: 800;
}

.empty,
.footnote {
  margin: 10px 0 0;
  color: #9a8b78;
  font-size: 12px;
  line-height: 1.7;
}
</style>
