# 骑乐网 · 新代码（Vue 3 前端 + Express 后端）

这是「旧代码」的迁移版：前端从原生 HTML + 手写 DOM 换成 Vue3，后端从 `旧代码/app` 整体搬进本目录的 `server/`。

> 目录说明：项目根下有两个文件夹 —— `旧代码/`（原来的页面、样式、图片，原样保留，随时对照回退）
> 和 `新代码/`（就是本目录，前端 + 后端都在这里）。
>
> 详细的逐文件说明见 **[项目结构说明.md](项目结构说明.md)**。

## 跑起来

**最省事**：双击 `启动.cmd`，它会自动判断依赖，然后同时起前端(5173)和后端(3000)。

手工跑：

```bash
cd 新代码
npm install          # 首次；依赖已随项目提供，通常可跳过

npm run start        # 同时起 Vite(5173) + Express(3000)（用 concurrently）
# 或者分开起：
npm run dev          # 前端 http://localhost:5173
npm run server       # 后端 http://localhost:3000（node --watch，改代码自动重启）
```

后端需要本地 MySQL 已启动，数据库账号密码在 `server/.env` 里配。

生产部署：

```bash
npm run build        # 产物进 dist/
npm run server       # Express 自动托管 dist/，只开 3000 一个端口即可
```

### 依赖已经装好了，可以直接跑

`node_modules/` 是随项目一起给你的，**不需要再 `npm install`**。直接 `npm.cmd run start` 或双击 `启动.cmd`；
完全绕开 npm 也可以：`node node_modules/vite/bin/vite.js dev` + `node server/app.js`。

### 常见问题：`npm install` 报「无法加载文件 npm.ps1，因为在此系统上禁止运行脚本」

这是 Windows 默认禁止运行 PowerShell 脚本（`npm.ps1`），**跟项目没关系**。三种解法任选：

```powershell
# ① 根治（只影响当前用户，不需要管理员），之后 npm install / npm run dev 都能直接用
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
# 设完关掉这个终端重新开一个

# ② 不改系统设置，把 npm 换成 npm.cmd
npm.cmd install
npm.cmd run start

# ③ 只给当前窗口临时放开
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

## 已经迁移的内容

| 原文件（在 `旧代码/` 下） | 迁移后 | 关键变化 |
| --- | --- | --- |
| 17 份复制粘贴的 `<nav>` | `components/NavBar.vue` | 导航只写一次；`onmouseover="jr1(this)"` 全局函数 → CSS `:hover` |
| 各页复制粘贴的页脚 | `components/FooterBar.vue` | 同上 |
| `骑乐网.html` 的「自己组装/保养/维修爱车」+「其他自行车用品」 | `views/HomeView.vue`（首页） | 5 个 float + `position:relative` 方块（写死 1400×700）→ CSS Grid（首行 2.2:1:1，次行装配占 1 列、异响占 2 列）；配色/图文/竖排标题照搬 |
| `骑乐网.html` 的「网站功能 / 关于网站 / 关于我们与网站 / 入门向导」 | `views/AboutView.vue`（`/about`） | 介绍性内容独立成页，首页让位给工具入口 |
| 旧站里只有导航、没有正文的页面（维修工具/刹车/异响/配件/服装头盔/车架） | `views/PendingView.vue`（`/pending/:name`） | 点进去不再是空白，说明"整理中"并给出可用入口 |
| `HTML/论坛.html` + `JS文件/评论区代码.js`（413 行） | `views/ForumView.vue` + `components/CommentItem.vue` + `api/comments.js` | `innerHTML` 拼字符串 → 组件插值（顺带修掉 XSS）；8 个 `getElementById` + `addEventListener` → `v-model` / `@submit`。**升级**：楼中楼回复（回复 @某人）、**最多 9 张图**、**1 个视频（≤50MB）**、九宫格 + 视频播放；后端预留 `auditStatus` 审核字段与 `/api/admin/comments` 接口 |
| `HTML/装配计算器.html`（381 行手写 TR）+ `表格计算器.js` + `装配计算器.js` | `views/CalculatorView.vue` + `components/CalcRefPanel.vue` + `data/calculatorRefs.js` + `data/shifterTables.json` | 30 多个 `<tr>` → 一份数据数组 + `v-for`；合计用 `computed` 自动算；xlsx 按需 `import()`。**新增左右分栏 + 双向折叠**：右侧「参考内容」三个标签分别承接原来的**车架推荐 / 零件道具 / 变速器**（变速器表格由 `scripts/extract-calc-refs.mjs` 从旧站资料自动抽取），折叠状态记在 localStorage |
| `HTML/变速器大全.html` + `JS文件/变速器大全-选项框.js`（1,058 行） | `views/ShifterView.vue` + `data/shifterBrands.js` + `data/shifterMeta.js` | 8 个品牌的 900 多行正文原样抽成数据模块；分类/品牌切换、淡入动画、页头滚动图片、CSV 参数表全部保留 |
| `HTML/变速器调试.html` + 3 个动画 JS | `views/TuningView.vue`（`/shifters/tuning`） | 子导航改吸顶锚点；「手变/前拨/后拨」鼠标悬停切图 → `partIndex`；异响 3 个标签 → `tabIndex`；55MB 本地教学视频改成 B 站外链 |
| `HTML/整车页面.HTML` + `整车页面js.js` + `json/自行车推荐数据.json` | `views/BikesView.vue`（`/bikes`） + `data/bikes.json` | 73 款车 JSON 改为构建期 import（不再发请求）；问卷 4 题用 `v-model` + `computed` 过滤；wordcloud2.js 换成纯 CSS 词云 |
| `HTML/运动简介.html`、`装备介绍和骑行知识/*.html`、`公路车.html`、`山地车.html` | `views/ArticlesView.vue`（`/articles`） + `views/ArticleView.vue`（`/article/:slug`） + `data/articles.js` + `public/articles/` | 5 篇正文抽出并清洗（去 script/内联样式/事件），图片 15 张 7.9MB 放 public；公路车页原来正文被注释，从注释里恢复了 3 节 |
| `HTML/个人信息.html` + `JS文件/个人信息.js` | `views/ProfileView.vue`（`/profile`） + `api/users.js` | 升级成**个人中心**（参考 B 站布局）：概览 / 改资料（含**改用户名**）/ **换头像** / **改密码（验旧密码）** / **我的评论管理**（筛选、编辑、删除）；注销走 `DELETE` |
| 无（新增） | `views/ForgotPasswordView.vue`（`/forgot-password`） + `server/utils/mailer.js` + `password_resets` 表 | **邮箱验证码找回密码**：6 位码、10 分钟有效、60 秒冷却、最多试 5 次；未配置 SMTP 时走开发模式（控制台 + devCode） |
| `HTML/地图.html` | `views/MapView.vue`（`/map`） | 高德 JS API 改为进入路由才加载；key 支持 `VITE_AMAP_KEY`；加载失败有明确提示而不是白屏 |
| `HTML/登陆页面.html` 内联 script + `用户登录.js`（两份重复实现，规则还不一致） | `views/LoginView.vue` + `api/auth.js` + `stores/user.js` | 合并成一份；前端 2-30 位校验对齐后端 3-30 位；登录态统一进 Pinia |
| **`旧代码/app/` 整个后端** | **`server/`** | 依赖补进 package.json、静态目录精简、托管 dist、修密码泄露/默认头像/`/me` 路由/越权/删号 500 等 6 个问题，详见结构说明第八节 |

## 样式说明（你会慢慢调的部分）

原 `旧代码/css文档/` 里的样式**基本没重写**，都复制到了 `src/assets/legacy/`，改动只有下面几处，文件里都写了注释：

1. `论坛.css` / `装配计算器.css` / `变速器大全.css` 的 `body{...}` → 页面容器类（SPA 只有一个 body，背景会互相覆盖）；
2. 导航 `#nav_1` 的 `width:1900px` → `100%`；
3. 置顶按钮写死的 `left:1790px` → 固定右下角；
4. `变速器大全.css` 里 4 个「逗号后半段是全局选择器」的规则（`#header1 th, td`、`.series-section th, td`、裸 `th`、裸 `tr:hover`）补上了限定，否则会串到计算清单和页脚的表格上。

改样式时直接改 `src/assets/legacy/` 下的文件即可；想用 `<style scoped>` 逐步收编也行，两种方式可以共存。

## PC 自适应（1280 ~ 2560）

桌面端已适配：5 个页面在 **1024 / 1152 / 1280 / 1440 / 1600 / 1920 / 2560** 七个宽度下
都**没有横向滚动条，也没有表格列被裁切**。

| 宽度 | 表现 |
| --- | --- |
| ≥ 1920 | 内容有最大宽度（首页 1080、讨论区 1100、计算器 1400、变速器大全 1400），居中，两侧留白 |
| 1440 ~ 1919 | 默认样式，表格与字号按视口轻微缩放 |
| 1280 ~ 1439 | 表格字号/内边距收紧，导航字号 17px |
| 1000 ~ 1279 | 导航 15.5px、表格列更窄，仍然不出现横向滚动 |
| < 1000 | 会出现横向滚动条（**手机端留到下一步做**） |

四个固定做法（新增页面时照着来就不会出问题）：

1. 容器宽度用 `min(设计宽度, xx vw)`，不要写死 px；
2. 字号用 `clamp(最小, x vw, 最大)`；
3. 表格用 `<colgroup>` + `table-layout: fixed` 按百分比分列（见 `CalculatorView.vue`）；
4. 背景图 `background-size: cover`，图片统一 `max-width: 100%`（在 `base.css` 里）。

改动位置：`src/assets/base.css`（全局基线）、各组件 `<style scoped>`（布局）、
`src/assets/legacy/*.css`（v-html 里的内容 + 背景）。

> 顺便修掉了 3 个「全局选择器泄漏」，它们在宽屏或其它页面都会出问题：
> - `页脚.css` 里裸 `table { left: 100px }` —— 会把装配清单整张表右移 100px，直接顶出横向滚动条；
> - `变速器大全.css` 里 `#header1 th, td`、`.series-section th, td`、裸 `th`、裸 `tr:hover` —— 会把页脚和计算器的表格一起染色；
> - `@keyframes a { form { ... } }` 的 `from` 笔误。

复检方法（脚本已放进仓库）：

```bash
npm run dev
node scripts/layout-audit.mjs                                  # 审计开发服务器
BASE_URL=http://localhost:4173 node scripts/layout-audit.mjs     # 审计构建产物（先 npm run build && npm run preview）
```

会逐条打印「页面 × 宽度」是否正常，最后一行给出问题总数（当前 `0 / 35`）。

## 目录

```
新代码/
├── server/            后端（Express + Sequelize + MySQL）
│   ├── app.js         服务入口：中间件、静态资源、路由、数据库、监听
│   ├── config/        数据库连接
│   ├── models/        User / Comment / CommentImage + 关联
│   ├── routes/        auth / users / comments 三组接口
│   ├── controllers/   用户资料业务逻辑
│   ├── middlewares/   JWT 鉴权、文件上传
│   ├── utils/         去掉 password 的 publicUser
│   ├── uploads/       用户上传的图片
│   ├── .env           本地配置（数据库、JWT、端口）
│   └── .env.example   配置模板
├── public/            图标、logo、蓝图视频、articles/（5 篇文章的 15 张配图）
├── scripts/           extract-shifter-data.mjs（从 旧代码 抽变速器资料）+ layout-audit.mjs（PC 布局审计）
└── src/               前端
    ├── api/           http 实例（拦截器统一加 token / 401 登出）+ auth / comments / users 接口
    ├── assets/legacy/  从 旧代码/css文档/ 复制来的 6 个 CSS
    ├── components/    NavBar / FooterBar / CommentItem
    ├── data/          shifterBrands.js、shifterMeta.js、bikes.json（73 款车）、articles.js（5 篇文章）
    ├── router/        16 条路由（首页 / 关于 / 整车 / 变速器 ×2 / 文章 ×2 / 计算清单 / 讨论区 / 个人中心 / 找回密码 / 地图 / 整理中 / 登录）
    ├── stores/        Pinia 登录态
    ├── utils/         resolveAssetUrl（统一处理 /uploads 路径）、时间格式化
    └── views/         Home / About / Bikes / Shifter / Tuning / Articles / Article / Calculator / Forum / Profile / ForgotPassword / Map / Pending / Login
```

## 已知未完成

- **评论审核管理页**：后端接口（`/api/admin/comments*`）和 `auditStatus` 字段已就绪，
  还差一个 `views/AdminCommentsView.vue`；先把账号设成管理员：`npm run admin 你的用户名`；
- 整车/车架/配件/服装头盔/刹车/维修工具：静态展示页，搬进 `<template>` 即可；
- **个人空间**：依赖后端 `/api/posts`（旧站这个接口根本没实现），需要新增 posts 表和接口；
- **找回密码要真正发信**：需要配 SMTP（见 `server/.env.example` 与 `项目结构说明.md` 第十二节）；
- 运动简介 / 装备介绍 / 骑行知识：`旧代码/文案/` 里 20 篇 txt 可以转成 md，用 `/knowledge/:slug` 一条路由全搞定；
- 后端安全项（multer 升级、cookie httpOnly、登录限流）见 `项目结构说明.md` 第十节。
