<script setup>
import '@/assets/legacy/页脚.css'

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
            <td>制作者:</td>
            <td>Zero_Point</td>
            <td>闲尘游</td>
            <td>晓峰</td>
          </tr>
          <tr>
            <td>创作时间：</td>
            <td>2024/4/22</td>
            <td />
          </tr>
          <tr>
            <td>注意事项：</td>
            <td>本网站仅供学习参考</td>
            <td>如有疑问请联系邮箱</td>
          </tr>
          <tr>
            <td>邮箱：</td>
            <td>Z1916819975@163.com</td>
            <td />
          </tr>
        </tbody>
      </table>
    </div>

    <div class="foot_logo">
      <p class="wx">微信公众号<br /><strong>13556870440</strong></p>
    </div>
  </footer>

  <div class="网站信息">
    <ul id="foot">
      <li>©2024 普骑屋</li>
      <li>本内容仅供参考，如有疑问可联系我们</li>
      <li>微信号：13556870440</li>
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
</style>
