<script setup>
import { useI18n } from 'vue-i18n'

import '@/assets/legacy/页脚.css'

const { t } = useI18n()

function toTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <footer class="div1">
    <div class="tab_div_foot">
      <table id="foot_tab" cellspacing="10">
        <tbody>
          <tr>
            <td>{{ t('footer.maker') }}</td>
            <td>Zero_Point</td>
            <td>闲尘游</td>
            <td>晓峰</td>
          </tr>
          <tr>
            <td>{{ t('footer.createdAt') }}</td>
            <td>2024/4/22</td>
            <td />
          </tr>
          <tr>
            <td>{{ t('footer.notice') }}</td>
            <td>{{ t('footer.noticeText') }}</td>
            <td>{{ t('footer.ask') }}</td>
          </tr>
          <tr>
            <td>{{ t('footer.email') }}</td>
            <td>Z1916819975@163.com</td>
            <td />
          </tr>
        </tbody>
      </table>
    </div>

    <div class="foot_logo">
      <p class="wx">{{ t('footer.wechat') }}<br /><strong>13556870440</strong></p>
    </div>
  </footer>

  <div class="网站信息">
    <ul id="foot">
      <li>{{ t('footer.copyright') }}</li>
      <li>{{ t('footer.ask') }}</li>
      <li>WeChat: 13556870440</li>
    </ul>
  </div>

  <!-- 原来这个按钮写死 left:1790px / top:850px，小屏直接跑到屏幕外，这里改成右下角固定 -->
  <button type="button" class="bi" aria-label="回到顶部" @click="toTop">↑</button>
</template>

<style scoped>
.foot_logo {
  display: flex;
  align-items: center;
  justify-content: center;
}

.wx {
  margin: 0;
  color: #333;
  font-size: 16px;
  line-height: 1.9;
  text-align: center;
}

#foot {
  display: flex;
  flex-wrap: wrap;
  gap: 28px;
  margin: 0;
  padding: 6px 24px;
  color: #fff;
  font-size: 14px;
  list-style: none;
}

.bi {
  position: fixed;
  right: 24px;
  bottom: 24px;
  top: auto;
  left: auto;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: rgba(90, 90, 90, 0.75);
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  z-index: 1000;
}

.bi:hover {
  background: #555;
}

/* ============================================================
   PC 自适应
   原样式：`.div1` 固定 350px 高、内部两个 50% 浮动的块、表格 left:100px。
   现在：改成 flex 两端布局 + 内容最大宽度，宽屏不会被拉散，窄屏也不会挤。
   ============================================================ */
.div1 {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: clamp(24px, 4vw, 80px);
  height: auto;
  min-height: 300px;
  padding: clamp(28px, 3vw, 48px) clamp(24px, 4vw, 64px);
  box-sizing: border-box;
}

.tab_div_foot {
  float: none;
  width: auto;
  max-width: 760px;
  flex: 1 1 520px;
  border-right: none;
}

.foot_logo {
  float: none;
  width: auto;
  flex: 0 0 clamp(220px, 22vw, 320px);
}

#foot_tab {
  position: static;
  left: 0;
  top: 0;
  width: 100%;
  margin: 0 auto;
}

/* 底部那条蓝色信息栏：宽屏时内容居中，不要贴左边 */
#foot {
  justify-content: center;
}

@media (max-width: 1440px) {
  .div1 {
    gap: 30px;
    padding: 28px 32px;
  }
}
</style>
