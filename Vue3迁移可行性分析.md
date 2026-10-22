# 骑乐网 v0.0.1 → Vue 3 迁移可行性分析

> 项目根目录现在分两个文件夹：
>
> - **`旧代码/`** —— 2 年前的原页面、样式、脚本、图片、视频，**一个字节没动**，随时可以对照和回退；
> - **`新代码/`** —— 迁移后的完整工程：`src/` 是 Vue3 前端，`server/` 是原来的 Express 后端（已整体迁入）。
>
> 下文为了和原代码逐行对照，仍按原项目的相对路径书写（如 `app/routes/auth.js`、`JS文件/评论区代码.js`），
> 这些**原文件**现在在 `旧代码/` 下，**迁移后的后端**在 `新代码/server/` 下；前端对应位置写成 `src/xxx`。
> 逐文件的说明见 `新代码/项目结构说明.md`。

---

## 0. 一句话结论

**可以换，而且属于「低风险、中等工作量」的迁移。**

三个理由：

1. **后端不用动**：`app/` 里已经是标准的 Express + Sequelize + MySQL + REST 接口（13 个端点），Vue 只是换掉表现层，接口原样可用。
2. **前端体量很小**：3,240 行 HTML + 3,495 行 JS + 4,418 行 CSS，交互代码的 60% 集中在 7 个文件里，其余都是内容展示。
3. **样式资产能整份复用**：现有 CSS 不用重写，我实测只改了 3 处选择器就让原样式在 Vue 里正常工作了。

工作量参考：

| 目标 | 工期 | 说明 |
| --- | --- | --- |
| 已验证（已完成） | 1 天 | 导航/页脚 + 5 个页面跑通（含变速器大全），证明技术路线没问题 |
| 全部迁移 | **剩余约 7 人天**（熟手）/ 2 周左右（边学边做） | 29 个页面 → 约 18 条路由，8 个品牌的资料已经迁完 |
| 风险 | **低** | 不动数据库、不动接口，可随时回退到旧页面 |

---

## 1. 我实际做了什么验证

新建 `新代码/`，用 Vite 6 + Vue 3.5 + vue-router 4 + Pinia + axios，把**最能代表项目难点**的 7 个区块真迁移了一遍：

| 迁移内容 | 原文件 | 结果 |
| --- | --- | --- |
| 全局导航栏 + 页脚 | 17 份复制粘贴的 `<nav>` / 页脚 | 2 个组件，只写一次 |
| 首页骨架 | `骑乐网.html`（824 行） | `HomeView.vue` |
| 讨论区 | `论坛.html` + `评论区代码.js`（413 行） | 1 个 view + 1 个组件 + 1 个 api 模块 |
| 装配清单 | `装配计算器.html`（381 行）+ 2 个 js | 数据数组 + `v-model` + `computed` |
| **变速器大全** | `变速器大全.html` + `变速器大全-选项框.js`（1,058 行） | 1 个 view + 2 个 data 模块，8 个品牌资料原样保留 |
| 登录 / 注册 | `登陆页面.html` 内联脚本 + `用户登录.js` | 1 个 view + Pinia store |

构建结果（真实输出，125 个模块）：

```
✓ 125 modules transformed.
✓ built in 3.42s
dist/assets/index-*.js           114.01 kB │ gzip:  44.97 kB   ← Vue + Router + Pinia
dist/assets/http-*.js             52.03 kB │ gzip:  19.85 kB   ← axios
dist/assets/ShifterView-*.js      34.88 kB │ gzip:   8.16 kB   ← 900 多行品牌资料
dist/assets/HomeView-*.js          3.50 kB │ gzip:   1.94 kB   ← 按路由分包
dist/assets/CalculatorView-*.js    6.07 kB │ gzip:   3.00 kB
dist/assets/xlsx-*.js            429.52 kB │ gzip: 143.08 kB   ← 点「下载表格」才加载
```

也就是说：**首屏 JS 约 65 KB（gzip）**，Excel 导出那 429 KB 只在点击下载时才请求 —— 这比现在每页挂 CDN 脚本、每次全量下载要好得多。

依赖安装也没有问题（74 个包，6 秒装完），`vue-router` / `pinia` / `axios` / `xlsx` 都能正常解析。

### 1.1 变速器大全：8 个品牌逐个点过（自动化冒烟测试）

用 Edge headless + DevTools 协议打开 `/shifters`，依次点击 8 个品牌，再把渲染结果和源数据逐个核对：

| 品牌 | 源数据（表格/行） | 迁移后渲染 | 备注 |
| --- | --- | --- | --- |
| 蓝图 | 3 / 24 | 3 / 24 | 含 1 个介绍视频（10.7 MB，已放进 `public/video/`） |
| 顺泰 | 1 / 9 | 1 / 9 | |
| 速瑞达 | 7 / 36 | 7 / 36 | 7 个系列表 |
| 微转 | 2 / 9 | 2 / 9 | |
| 博力为 | 1 / 5 | 1 / 5 | |
| 禧玛诺 SHIMANO | 2 / 15 | 2 / 15 | |
| 速联 SRAM | 0 / 0 | 0 / 0 | 原版就是占位文案，保留原样 |
| Campagnolo | 0 / 0 | 0 / 0 | 同上 |

同时验证到：切分类后会像原来一样默认选中该类第一个品牌；`.brand-content` 的 300ms 淡入动画仍在跑（抓到的 opacity 中间值 0.23~0.40）；页头 3 张图片的滚动动画正常。

---

## 2. 现状体检（数据都是实测的）

### 2.1 规模

| 类型 | 文件数 | 行数 | 备注 |
| --- | --- | --- | --- |
| HTML | 29 | 3,240 | 最大 `骑乐网.html` 824 行 |
| JS | 35 | 3,495 | 最大 `变速器大全-选项框.js` 1,059 行 |
| CSS | 30 | 4,418 | 无预处理器、无构建工具 |
| 后端 | 15 | ~900 | 13 个 REST 端点，3 张表 |

### 2.2 代码形态（这几个数字决定了迁移策略）

| 指标 | 数量 | 意味着什么 |
| --- | --- | --- |
| 内联事件 `onclick/onmouseover/onmouseout` | **296 处** | 全部要换成 `@click` / CSS `:hover` |
| `document.getElementById` | **84 次** | 全部换成模板绑定 |
| `innerHTML` 拼字符串 | **18 处** | 全部换成插值 / `v-for`（顺带修 XSS） |
| `addEventListener` | **26 处** | 换成 `@事件` 或 `onMounted` |
| 硬编码 `localhost:3000` | **32 处** | 收进 1 个 axios 实例 + proxy |
| 重复的导航栏 `<nav id="nav_1">` | **17 份** | 收敛成 1 个组件 |
| `<script>` 标签 | **56 个** | 现在靠加载顺序「碰运气」 |
| 重复 id | 装配计算器里 `#配件 #单价 #数量 #规格 #备注` **各 27 次** | 非法 HTML，改数据驱动后自然消失 |
| jQuery 实际调用 | **0 次** | 引了 90KB 的库但一行没用，可直接删 |

### 2.3 技术依赖

- 外部 CDN：jQuery（没用到）、PapaParse、wordcloud2、xlsx、高德地图 JS API
- 无 `package.json`、无 `git`、`node_modules` 里 176 个包版本不可复现
- 前端实际跑在 VS Code Live Server（5500），后端 3000，靠 CORS 白名单连通

---

## 3. 为什么这个项目特别适合换 Vue3

1. **数据层早就分离了。** 登录、评论、用户信息都走 `fetch` + JWT，页面里没有一行业务 SQL。Vue3 只接管渲染，后端接口零改动。
2. **页面以「内容展示」为主。** 29 个页面里 9 个是纯静态图文，5 个是长文内容页，真正有交互的只有 8 个。
3. **CSS 是资产不是负债。** 配色、字体、动画都挺有辨识度，`新代码/` 里我原样复制了 6 个 CSS 文件，改动只有 4 类（`body{}` → 页面容器类、导航 `width:1900px` → `100%`、置顶按钮写死坐标、4 个「逗号后半段是全局选择器」的泄漏），视觉效果基本不变。
4. **交互代码高度集中。** `评论区代码.js`(16KB) + `变速器大全-选项框.js`(36KB) + `个人信息.js` + `个人空间.js` + 登录 + 计算器 ≈ 前端 JS 的 **60%**，迁移难点就这 7 个文件。
5. **痛点正好都是 Vue 的强项。** 列表渲染、表单双向绑定、合计自动计算、跨页登录态、导航复用 —— 现在每一处都在用复制粘贴 + 手动 DOM 硬扛。
6. **规模小到可以「一次看懂」。** 3,240 行 HTML 对一个人来说两周能全部过一遍。

---

## 4. 迁移前必须知道的 12 个坑（附证据）

| # | 问题 | 证据 | 迁移时怎么处理 |
| --- | --- | --- | --- |
| 1 | **登录态有两套并存**：`sessionStorage.token`（JWT）+ 明文 `user` cookie（`httpOnly:false`） | `app/routes/auth.js:87-92`、`骑乐网.html:52-96`、`JS文件/个人空间.js:15` | 统一进 Pinia + axios 拦截器；建议后端改成 `httpOnly` cookie 或只认 Bearer |
| 2 | **接口地址散落 32 处** | `评论区代码.js:16`、`用户登录.js:5`、`个人信息.js:81` 等 | 1 个 `http.js` 实例 + Vite proxy，代码里只写 `/api/xxx` |
| 3 | **图片路径手工 `replace('../app/uploads/')`** | `评论区代码.js:141-145` 重复 3 遍 | 统一 `resolveAssetUrl()`；开发走 proxy，生产走同域 Nginx |
| 4 | **后端把绝对地址写进数据库** | `app/routes/comments.js:102`、`:291` 存的是 `http://localhost:3000/uploads/xxx` | **必须改后端**，否则换域名/上线后所有评论图全裂 |
| 5 | **重复 id**，尤其中文 id | 装配计算器 27 组；`骑乐网.html` 的 `id="hov"` ×4 | 改 `v-for` + `ref`；中文 id 尽量换 class |
| 6 | **296 个内联事件 + 全局函数** | `导航栏.js` 的 `jr1/lk1`、`整车页面.HTML`、`公路车.html` | 换 `@click` / `:hover`，全局函数整体删除 |
| 7 | **`innerHTML` 直接插入用户评论**，有 XSS | `评论区代码.js:186-201` | Vue 插值自动转义，这条直接消失 |
| 8 | **CSS 依赖 body 和固定像素** | `论坛.css:1` 的 `body{background-image}`、`导航栏.css:5` 的 `width:1900px`、页脚置顶按钮 `left:1790px` | `body{}` 改页面容器类；固定宽度改 `%` / `clamp()` |
| 9 | **前后端校验规则不一致** | 前端用户名 2–30 位（`登陆页面.html:78`），后端 3–30 位（`app/routes/auth.js:15`） | 以接口为准，只保留一份规则 |
| 10 | **已经有坏死的引用** | `变速器大全-选项框.js:71` 加载 `csv/蓝图变速器.csv`（不存在）；`个人空间.js` 依赖 `/api/posts`（后端没有）；默认头像 `/img/图标文件/默认头像.png`（不存在） | 迁移时逐个补齐，别带着 bug 一起搬 |
| 11 | **前端文件里混进了后端代码** | `JS文件/个人空间.js:141-176` 直接写了 `app.post('/api/posts', ...)` | 迁移时必须拆掉，这段一加载就 `ReferenceError` |
| 12 | **仓库卫生** | `video/` 4.7 GB、字体 zip 437 MB、`演示视频.mp4` 126 MB、无 `.gitignore` | 迁移前 `git init` + 把媒体资源移出仓库或放对象存储 |

> 补充一个**好消息**：我检查了全部 131 个文本文件，**编码是统一的 UTF-8**（119 个含中文的 UTF-8 + 12 个纯 ASCII，没有 GBK 混杂）。这一点不用担心。

---

## 5. 三档方案，推荐 B

| 方案 | 做法 | 工期 | 风险 | 适合 |
| --- | --- | --- | --- | --- |
| **A. 渐进嵌入** | 保留全部旧 HTML，只在「讨论区 / 变速器大全 / 计算器」三个重交互页里 `createApp().mount()` 嵌一个 Vue 组件 | 2–3 天 | 极低 | 只想先尝鲜 / 答辩前不敢大改 |
| **B. 并行新站（推荐）** | 新建 `新代码` 这类工程，逐页替换，旧页面在新路由做好前继续可用 | 约 7.5 人天（已做完 1 天） | 低 | 绝大多数情况 |
| **C. 一次性重写** | 停掉旧站，全量重写再上线 | 7–10 天 | 高 | 不推荐：中途无法演示，容易拖垮答辩 |

**强烈建议 A→B 的组合**：先用 A 的方式把 Vue 跑起来（我已经把骨架做好了），确认环境没问题，再按第 7 节的分期推进 B。

---

## 6. 目标架构

```
vue3-migration/
├── index.html
├── vite.config.js          # /api、/uploads 代理到 3000
└── src/
    ├── api/                # http.js（拦截器：带 token / 401 登出）+ auth.js + comments.js
    ├── assets/
    │   ├── base.css        # 最小重置
    │   ├── legacy/         # 原 css文档/ 的 5 个样式，几乎原样复用
    │   └── img/
    ├── components/         # NavBar / FooterBar / CommentItem
    ├── router/             # 18 条路由（按需分包）
    ├── stores/             # Pinia：user（登录态）、后续可加 comments / cart
    ├── utils/              # resolveAssetUrl / formatTime
    └── views/              # Home / Forum / Calculator / Login / ...
```

选型建议：

| 需求 | 选择 | 理由 |
| --- | --- | --- |
| 构建 | Vite 6 | 秒级冷启动，零配置即可跑 |
| 路由 | vue-router 4 | 29 页 → 18 条路由，天然解决 SEO 之外的导航复用 |
| 状态 | Pinia | 登录态、评论列表、清单草稿 |
| 请求 | axios | 拦截器统一加 token / 处理 401 |
| Excel 导出 | `xlsx`（按需 `import()`） | 替代 CDN 全局变量 |
| 地图 | `@amap/amap-jsapi-loader` | 替代手写 `<script>` |
| 词云 | `wordcloud2.js` npm 包 | 替代 CDN |
| 组件库 | **不建议引入 Element Plus / Ant Design Vue** | 现有 CSS 是花了心思的视觉资产，引组件库反而把页面「洗」成千篇一律，毕业设计辨识度会掉 |

---

## 7. 分阶段路线与工作量

| 阶段 | 内容 | 工期 | 验收标准 |
| --- | --- | --- | --- |
| **P0 准备** | `git init`、补 `package.json`、媒体资源移出仓库、统一 API base、封装 `http.js` | 0.5 天 | `npm run dev` 能起来，`/api` 能通 |
| **P1 骨架** | Vite 工程 + Router + NavBar/FooterBar + 首页 | 1.5 天 | 首页视觉与现在一致，导航不再重复 |
| **P2 账号** | 登录/注册 + Pinia + 个人信息；顺手补 `/api/posts` 接口后再做个人空间 | 2 天 | 登录 → 刷新不掉线 → 头像正常 |
| **P3 讨论区** | 评论列表 / 发评论 / 传图 / 删除 / 大图预览 | 1 天 | 与原功能等价，且无 XSS |
| **P4 工具页** | 变速器大全（36KB 数据 → JSON + `v-for`）、装配计算器、整车/车架/配件页 | 2.5 天 | 交互一致；计算器改单价即时出总价 |
| **P5 内容页 + 收尾** | 运动简介、装备介绍、骑行知识（`文案/` 20 篇 txt → md）、地图、404、构建部署 | 1.5 天 | `vite build` 通过，Nginx 单域名上线 |

合计 ≈ **9 人天**。学生自己边查文档边做，按 2–3 周估。

---

## 8. 29 个页面难度分级

| 档位 | 页面 | 数量 | 做法 | 单页耗时 |
| --- | --- | --- | --- | --- |
| **删除/合并** | `入口.html`、`HTML/login.html`（与登陆页重复）、`HTML/关于网站.html`（0 字节）、`运动简介/页脚代码.html`、`05_动画案例.html`、`页头设计(测试文件).html` | 6 | 内容并入组件或直接删 | 0.2 天合计 |
| **静态展示** | 刹车、维修工具、异响、技巧篇、配件、服装头盔、车架页面、选择页面 | 8 | 直接搬进 `<template>`；建议合并成 `/article/:slug` 一条路由 + 数据文件 | 每页 0.5 小时 |
| **内容长文** | 运动简介、装备介绍、骑行知识、公路车、山地车 | 5 | 同上，文案转 md / JSON，一条路由搞定 | 每页 2–4 小时 |
| **地图** | 地图.html | 1 | `@amap/amap-jsapi-loader` | 2 小时 |
| **中等交互** | 变速器调试（选项卡/折叠，12KB）、整车页面（wordcloud2） | 2 | 选项卡用 `v-show` + 数组，词云用 `onMounted` | 各 0.5 天 |
| **重交互** | 论坛 ✅、登陆页面 ✅、装配计算器 ✅、变速器大全 ✅、个人信息、个人空间 | 6 | 组件 + store + api 模块 | 各 1–2 天 |
| **首页** | 骑乐网.html（824 行）✅ | 1 | 拆成轮播 / 板块 / 品牌表 / 工具区 4 个组件 | 2 天 |

> ✅ = 已在 `新代码/` 里完成，剩下标灰的页面按上表估时往下做即可。

> 省时技巧：`刹车 / 维修工具 / 配件 / 服装头盔 / 异响 / 技巧篇` 本质都是「标题 + 图文」，做成一个带 slug 的详情路由 + 一份数据文件，**8 个页面能压成 1 条路由**。29 个 HTML 最终大约 18 条路由。

---

## 9. 关键改造对照（已跑通的代码）

**① 导航栏：17 份复制 → 1 个组件**

```html
<!-- 原来：每个页面复制一遍，hover 靠全局函数改行内样式 -->
<li><a href="../HTML/整车页面.HTML" onmouseover="jr1(this)" onmouseout="lk1(this)">整车推荐</a></li>
```
```vue
<!-- 现在：router-link + CSS :hover，jr1/lk1 整体删除 -->
<li v-for="item in navItems" :key="item.label">
  <router-link v-if="item.to" :to="item.to">{{ item.label }}</router-link>
  <span v-else class="nav-todo">{{ item.label }}</span>
</li>
```

**② 评论区：手拼 HTML → 组件插值**

```js
// 原来（评论区代码.js:186）—— 用户输入被当 HTML 执行，XSS 入口
commentElement.innerHTML = `
  <div class="comment-header">${avatar}<span>${username}</span></div>
  <p>${comment.content}</p>`
```
```vue
<!-- 现在 —— 自动转义，删除逻辑也不再要求后端返回特定字符串 -->
<div class="comment-header">
  <img class="comment-avatar" :src="avatar" :alt="username" />
  <span class="comment-username">{{ username }}</span>
</div>
<p>{{ comment.content }}</p>
```

**③ 装配计算器：381 行手写 `<tr>` → 一份数据**

```vue
<tr v-for="row in rows" :key="row.id" class="item-row">
  <td>{{ row.label }}</td>
  <td><input v-model="row.part" type="text" /></td>
  <td><input v-model.number="row.price" type="number" /></td>
  <td><input v-model.number="row.qty" type="number" /></td>
</tr>
<!-- 原来要点「点击计算最终结果」才出总价，现在是 computed，改单价立刻变 -->
<input id="jsjs" :value="`¥${total.toFixed(2)}`" readonly />
```

顺带修掉的老 bug：`@keyframes a { form{...} }`（`from` 笔误，导致下载图标的放大动画从来没生效过）。

---

## 10. 后端调整（原计划 4 处，实际做了 6 处，均已完成）

> 后端已整体迁到 `新代码/server/`，下表的"原位置"指迁移前的 `旧代码/app/`。
> 详细的逐文件说明见 `新代码/项目结构说明.md` 第八节。

| 原位置 | 原问题 | 处理结果 |
| --- | --- | --- |
| `app/routes/comments.js:102`、`:291` | 把 `http://localhost:3000/uploads/...` 绝对地址存进库 | ✅ 改存 `/uploads/xxx`，换域名不会挂图 |
| `app/routes/auth.js:47` | 默认头像写 `/img/图标文件/默认头像.png`（文件不存在） | ✅ 改成 `/uploads/default_avatar.png` |
| `app/routes/auth.js:87-92` | 用户对象（含 bcrypt 哈希）明文塞进 cookie 和 JSON 响应 | ✅ 新增 `utils/publicUser.js`，响应与 cookie 都不再带 password |
| `app/app.js:11-36` | CORS 白名单是 Live Server 端口；静态目录指向旧前端 | ✅ 白名单改 5173/4173；静态目录只留 `/uploads` + 生产 `dist/` |
| `app/routes/userRoutes.js:9-12` | `/:id` 写在 `/me` 前面，`GET /api/users/me` 实际被 `:id="me"` 抢先匹配 | ✅ `/me` 前置，并新增 `getMe` |
| `app/routes/userRoutes.js` + `userController.js` | 任何人登录后都能改 / 删别人的账号 | ✅ 加"只能操作自己"校验（越权返回 403） |

顺手补的：删账号原来是**必 500**（外键约束挡住），现在改成事务里先删评论图片、再删评论、最后删用户；
上传目录改成绝对路径（原来依赖启动目录）；项目补了 `package.json`（原项目没有，依赖版本不可复现）。

后端接口用真实 MySQL 跑了 **23 项测试全部通过**，经 Vite 代理再跑 **8 项全部通过**，测试数据已清理干净。

---

## 11. 验收清单（迁移完逐条过）

- [ ] 登录 → 刷新页面不掉线 → 退出后导航栏回到「登录」
- [ ] 发表带图评论 → 列表立即出现 → 删除自己的评论成功 → 删别人的被拒
- [ ] 评论内容输入 `<script>alert(1)</script>` 只显示文本
- [ ] 计算器填 5 行单价数量，合计与手算一致；导出的 xlsx 列顺序正确
- [ ] 变速器大全切换国产品牌/进口品牌，规格表数据正确
- [ ] 手机宽度（375px）不出现横向滚动条
- [ ] `npm run build` 通过，`dist/` 部署到 Nginx 后 `/api`、`/uploads` 都通
- [ ] 旧页面路由全部 301 或跳转，不出现 404

---

## 12. 如果时间很紧，就做这 5 步

1. `git init`（`package.json` 已经补好，依赖版本可复现了）——目前**仍没有版本控制**，这是最大的隐患；
2. 直接复用 `新代码/` 的 `api/` + `stores/` + `NavBar` + `FooterBar`；
3. 先只迁 **登录** 和 **讨论区** 两页（答辩演示效果最直接）——这两块已经做完，可以直接讲；
4. 计算器页改成 `v-for` + `computed`（代码量砍掉 2/3，答辩讲起来最有说服力）——也已完成；
5. 其余页面保持原样，用 `<a href>` 跳回旧页面 —— Vue 允许这种「半迁移」状态长期存在。

---

## 附录：怎么跑起来

```bash
cd 新代码
npm install          # 首次
npm run start        # 同时起前端 5173 + 后端 3000

# 只想起前端（不看数据）
npm run dev

# 只想起后端
npm run server       # 需要本地 MySQL，配置在 新代码/server/.env
```

也可以双击 `新代码/启动.cmd` 一键启动。
生产部署：`npm run build` 之后 `npm run server`，Express 会同时托管 `dist/`，只需一个端口。

后端没启动也能看界面：讨论区会提示「连不上后端接口」，登录表单、清单计算、变速器切换、路由跳转都正常。
逐文件说明见 `新代码/项目结构说明.md`。
