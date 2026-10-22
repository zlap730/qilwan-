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

## 已经迁移的 7 块

| 原文件（在 `旧代码/` 下） | 迁移后 | 关键变化 |
| --- | --- | --- |
| 17 份复制粘贴的 `<nav>` | `components/NavBar.vue` | 导航只写一次；`onmouseover="jr1(this)"` 全局函数 → CSS `:hover` |
| 各页复制粘贴的页脚 | `components/FooterBar.vue` | 同上 |
| `骑乐网.html`（824 行） | `views/HomeView.vue` | 首页骨架 + 迁移范围说明 |
| `HTML/论坛.html` + `JS文件/评论区代码.js`（413 行） | `views/ForumView.vue` + `components/CommentItem.vue` + `api/comments.js` | `innerHTML` 拼字符串 → 组件插值（顺带修掉 XSS）；8 个 `getElementById` + `addEventListener` → `v-model` / `@submit` |
| `HTML/装配计算器.html`（381 行手写 TR）+ `表格计算器.js` + `装配计算器.js` | `views/CalculatorView.vue` | 30 多个 `<tr>` → 一份数据数组 + `v-for`；点按钮算总价 → `computed` 自动算；xlsx 由 CDN 全局变量改为按需 `import()` |
| `HTML/变速器大全.html` + `JS文件/变速器大全-选项框.js`（1,058 行） | `views/ShifterView.vue` + `data/shifterBrands.js` + `data/shifterMeta.js` | 8 个品牌的 900 多行正文原样抽成数据模块；分类/品牌切换、淡入动画、页头滚动图片、CSV 参数表全部保留 |
| `HTML/登陆页面.html` 内联 script + `用户登录.js`（两份重复实现，规则还不一致） | `views/LoginView.vue` + `api/auth.js` + `stores/user.js` | 合并成一份；前端 2-30 位校验对齐后端 3-30 位；登录态统一进 Pinia |
| **`旧代码/app/` 整个后端** | **`server/`** | 依赖补进 package.json、静态目录精简、托管 dist、修密码泄露/默认头像/`/me` 路由/越权/删号 500 等 6 个问题，详见结构说明第八节 |

## 样式说明（你会慢慢调的部分）

原 `旧代码/css文档/` 里的样式**基本没重写**，都复制到了 `src/assets/legacy/`，改动只有下面几处，文件里都写了注释：

1. `论坛.css` / `装配计算器.css` / `变速器大全.css` 的 `body{...}` → 页面容器类（SPA 只有一个 body，背景会互相覆盖）；
2. 导航 `#nav_1` 的 `width:1900px` → `100%`；
3. 置顶按钮写死的 `left:1790px` → 固定右下角；
4. `变速器大全.css` 里 4 个「逗号后半段是全局选择器」的规则（`#header1 th, td`、`.series-section th, td`、裸 `th`、裸 `tr:hover`）补上了限定，否则会串到计算清单和页脚的表格上。

改样式时直接改 `src/assets/legacy/` 下的文件即可；想用 `<style scoped>` 逐步收编也行，两种方式可以共存。

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
├── public/            图标、logo、蓝图视频
├── scripts/           extract-shifter-data.mjs（从 旧代码 抽变速器资料，可重复跑）
└── src/               前端
    ├── api/           http 实例（拦截器统一加 token / 401 登出）+ 接口文件
    ├── assets/legacy/  从 旧代码/css文档/ 复制来的 6 个 CSS
    ├── components/    NavBar / FooterBar / CommentItem
    ├── data/          shifterBrands.js（8 个品牌资料）+ shifterMeta.js（分类/品牌元数据）
    ├── router/        6 条路由
    ├── stores/        Pinia 登录态
    ├── utils/         resolveAssetUrl（统一处理 /uploads 路径）、时间格式化
    └── views/         Home / Forum / Calculator / Shifter / Login
```

## 已知未完成

- 整车/车架/配件/服装头盔/刹车/维修工具：静态展示页，搬进 `<template>` 即可；
- 变速器调试页（`旧代码/HTML/变速器调试.html`）：选项卡 + 折叠动画，12KB，建议下一步做；
- 个人信息 / 个人空间：后端接口已具备（`/api/users/me`、`PUT /api/users/:id`），前端页面还没写；
  `/api/posts`（个人空间的"作品"）后端仍然没有，需要新增表和接口；
- 运动简介 / 装备介绍 / 骑行知识：`旧代码/文案/` 里 20 篇 txt 可以转成 md，用 `/knowledge/:slug` 一条路由全搞定；
- 地图页：高德 JS API 换成 `@amap/amap-jsapi-loader` 即可；
- 后端安全项（multer 升级、cookie httpOnly、登录限流）见 `项目结构说明.md` 第十节。
