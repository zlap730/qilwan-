<script setup>
const cards = [
  {
    title: '讨论区',
    desc: '原 评论区代码.js（413 行）里的「拉列表 / 发评论 / 传图 / 删除 / 预览」重写成 1 个 API 模块 + 2 个组件。',
    to: '/forum',
    action: '看评论组件'
  },
  {
    title: '装配清单',
    desc: '原 装配计算器.html（381 行手写 TR）+ 表格计算器.js，改成一份数据数组 + v-model，合计用 computed 自动算。',
    to: '/calculator',
    action: '看计算器'
  },
  {
    title: '变速器大全',
    desc: '原 变速器大全-选项框.js（1,058 行）里 8 个品牌的资料原样抽成数据模块，分类/品牌切换、淡入动画、CSV 参数表全部保留。',
    to: '/shifters',
    action: '看变速器大全'
  },
  {
    title: '登录 / 注册',
    desc: '原 登陆页面.html 的内联 script 与 用户登录.js 是两份重复实现，且校验规则和后端不一致，这里合并成一份。',
    to: '/login',
    action: '看登录页'
  }
]
</script>

<template>
  <main class="page-home">
    <section class="hero">
      <p class="kicker">VUE 3 迁移验证工程</p>
      <h1>普骑屋 · 骑乐网</h1>
      <p class="desc">
        同一个后端（Express + Sequelize + MySQL），只把表现层换成 Vite + Vue3 + vue-router + Pinia。
        导航与页脚从「29 个 HTML 各复制一份」变成只写一次；评论、清单、登录全部改成数据驱动。
      </p>
      <div class="hero-actions">
        <router-link class="btn primary" to="/forum">进入讨论区</router-link>
        <router-link class="btn ghost" to="/calculator">打包装配清单</router-link>
      </div>
    </section>

    <section class="cards">
      <article v-for="card in cards" :key="card.title" class="card">
        <h2>{{ card.title }}</h2>
        <p>{{ card.desc }}</p>
        <router-link :to="card.to">{{ card.action }} →</router-link>
      </article>
    </section>

    <section class="scope">
      <h2>本次验证覆盖的范围</h2>
      <div class="scope-grid">
        <div>
          <h3 class="done">已迁移（6）</h3>
          <ul>
            <li>全局导航栏 · 页脚（组件化，只写一次）</li>
            <li>首页骨架（原 骑乐网.html，824 行）</li>
            <li>讨论区（原 论坛.html + 评论区代码.js）</li>
            <li>装配清单（原 装配计算器.html + 2 个 js）</li>
            <li>变速器大全（原 变速器大全-选项框.js，1,058 行数据）</li>
            <li>登录 / 注册（原 登陆页面.html + 用户登录.js）</li>
          </ul>
        </div>
        <div>
          <h3 class="todo">未迁移（原文件原样保留，不影响验证）</h3>
          <ul>
            <li>整车/车架/配件/服装头盔/刹车/维修工具 · 静态展示页</li>
            <li>变速器调试（选项卡 + 折叠动画，12KB）· 与变速器大全配套，建议下一步做</li>
            <li>个人信息 / 个人空间 · 依赖后端 /api/posts（该接口目前不存在）</li>
            <li>运动简介 / 装备介绍 / 骑行知识 · 20 篇文案可转 md 数据驱动</li>
            <li>地图（高德 JS API）· 单独一个路由即可</li>
          </ul>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.page-home {
  padding: 60px 0 40px;
  background: linear-gradient(180deg, #fff8ee 0%, #fdf1e0 55%, #f6e6d2 100%);
}

.hero {
  width: min(1080px, 86vw);
  margin: 0 auto;
  padding: 72px 0 56px;
}

.kicker {
  margin: 0 0 12px;
  color: #c47a2c;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 4px;
}

.hero h1 {
  margin: 0 0 18px;
  color: #3a2c1c;
  font-size: clamp(32px, 5vw, 54px);
  letter-spacing: 2px;
}

.desc {
  max-width: 760px;
  margin: 0;
  color: #5d4a35;
  font-size: 17px;
  line-height: 1.9;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 32px;
}

.btn {
  display: inline-block;
  padding: 12px 28px;
  border-radius: 999px;
  font-size: 16px;
  font-weight: 700;
  transition: transform 0.15s ease, background-color 0.15s ease;
}

.btn:hover {
  transform: translateY(-2px);
}

.primary {
  background: #e8863c;
  color: #fff;
}

.primary:hover {
  background: #d2762f;
}

.ghost {
  border: 2px solid #e8863c;
  color: #b96a26;
}

.ghost:hover {
  background: rgba(232, 134, 60, 0.12);
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
  width: min(1080px, 86vw);
  margin: 0 auto;
}

.card {
  padding: 24px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 8px 26px rgba(120, 88, 46, 0.12);
}

.card h2 {
  margin: 0 0 12px;
  color: #3a2c1c;
  font-size: 20px;
}

.card p {
  margin: 0 0 16px;
  color: #6b5a45;
  font-size: 14px;
  line-height: 1.8;
}

.card a {
  color: #c47a2c;
  font-size: 14px;
  font-weight: 700;
}

.scope {
  width: min(1080px, 86vw);
  margin: 48px auto 0;
  padding: 28px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.72);
}

.scope h2 {
  margin: 0 0 20px;
  color: #3a2c1c;
  font-size: 20px;
}

.scope-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.scope h3 {
  margin: 0 0 10px;
  font-size: 15px;
}

.done {
  color: #2e7d32;
}

.todo {
  color: #a1662f;
}

.scope ul {
  margin: 0;
  padding-left: 20px;
  color: #5d4a35;
  font-size: 14px;
  line-height: 1.9;
}
</style>
