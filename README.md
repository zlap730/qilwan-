# 骑乐网 v0.0.1（Vue3 + Express）

```
骑乐网v0.0.1/
├── 旧代码/                     ← 2 年前的原项目，原样保留，随时对照 / 回退
│   ├── HTML/  css文档/  JS文件/  img/  video/  文案/ …
│   └── 骑乐网.html             原首页
│
├── 新代码/                     ← 现在维护的工程（前端 + 后端都在这里）
│   ├── src/                    Vue3 前端：views / components / router / stores / api / data
│   ├── server/                 Express 后端：app.js / routes / models / controllers / uploads
│   ├── public/                 图标、logo、视频
│   ├── dist/                   已构建产物（可直接丢 Nginx）
│   ├── 项目结构说明.md           ★ 逐文件夹、逐文件的作用注释 + 接口表 + 迁移改动清单
│   └── README.md               快速上手
│
└── Vue3迁移可行性分析.md        ← 体检数据、12 个坑、分期路线、验收清单
```

## 怎么跑

**最省事**：双击 `新代码/启动.cmd` —— 同时起前端(5173) 和后端(3000)。

手工跑：

```bash
cd 新代码
npm install            # 首次；依赖已随项目提供，通常可跳过
npm run start          # 同时起 Vite(5173) + Express(3000)

# 或者分开起
npm run dev            # 前端 http://localhost:5173
npm run server         # 后端 http://localhost:3000（需本地 MySQL，配置在 新代码/server/.env）
```

只想看界面、不想动数据库时，可以只起前端：讨论区会提示「连不上后端接口」，其余页面正常。

> 如果 `npm` 报「无法加载文件 npm.ps1，因为在此系统上禁止运行脚本」，是 Windows 的 PowerShell 执行策略限制，
> 与项目无关：把命令换成 `npm.cmd install` / `npm.cmd run start` 即可，或执行一次
> `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` 根治。详见 `新代码/README.md`。

## 迁移进度

| 已完成（`新代码/`） | 未迁移（仍在 `旧代码/`） |
| --- | --- |
| 导航栏 + 页脚（组件化、左对齐、PC 自适应） | 变速器调试页（有真实内容：原理图 + 异常处理） |
| 首页：自己组装/保养/维修爱车的工具入口 + 其他用品 | 整车推荐页（wordcloud + 品牌表） |
| 关于网站页（网站功能 / 纯公益初心 / 免责声明 / 入门向导） | 运动简介、装备介绍、骑行知识（正文内容页） |
| 讨论区（评论 CRUD + 传图） | 个人信息 / 个人空间（后端接口已就绪，页面未写） |
| 装配清单（自动合计 + 导出 Excel） | 地图（高德 JS API） |
| 变速器大全（8 个品牌资料 + 切换 + 视频） | 公路车 / 山地车分类页 |
| 登录 / 注册（Pinia 登录态） | 维修工具/刹车/异响/配件/服装头盔/车架：**旧站本身是空白页**，新版给了「整理中」落地页 |
| 后端整体迁入 `新代码/server/`（13 个接口 + 数据库） | |
