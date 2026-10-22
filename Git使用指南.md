# Git 使用指南（第一次用也能照着做）

> 你的仓库就在这里：`C:\Users\19168\Desktop\骑乐网v0.0.1`
> 现在状态：分支 `main`，已有第 1 次提交，打了标签 `v0.1.0`，工作区干净，还没连远程仓库。

---

## 0. 先建立直觉：git 就是给你的项目拍快照

```
  你的文件夹          暂存区           本地仓库
 (工作区)            staging           .git 里的历史
     │                  │                  │
     │  git add          │                  │
     ├─────────────────►│                  │
     │                  │   git commit      │
     │                  ├─────────────────►│
     │                  │                  │
  改文件                 │               每次提交 = 一张快照
```

一句话记住：

- **`git add`** = 把要保存的改动放进“待提交篮子”
- **`git commit`** = 给这个篮子拍一张快照并写一句说明
- **`git log`** = 查看历史快照
- **`git status`** = 我现在有哪些改动还没拍快照

平时 90% 的时间你只需要这三条：`git status` → `git add -A` → `git commit -m "说明"`。

---

## 1. 最省事的方式：双击 `提交.cmd`

项目根目录下我放了一个 `提交.cmd`，双击就能用：

- **1. 提交这次所有改动** —— 输入一句说明（比如“迁移个人信息页”），回车即可；
- **2. 看看这一版改了什么** —— 不提交，只是查看；
- **3. 撤销我还没提交的改动** —— 改错了想回到上次提交的状态（需要输入 `YES` 确认）；
- **4. 退出**。

不想记命令就一直用它。想学命令就往下看。

---

## 2. 命令行版：每天常用的 6 个操作

在项目根目录 `C:\Users\19168\Desktop\骑乐网v0.0.1` 打开终端（地址栏输入 `cmd` 回车最快）。

### ① 看看现在什么情况

```bash
git status
```

- 显示 `nothing to commit, working tree clean` = 干净，没有改动；
- 显示一堆 `modified: xxx` / `?? xxx`（`??` 表示新文件）= 这些改动还没提交。

### ② 提交（最常用）

```bash
git add -A
git commit -m "迁移个人信息页"
```

`add -A` 的意思是“把所有改动都放进篮子”，`-m` 后面是这次改动的说明。

### ③ 看历史

```bash
git log --oneline          # 一行一条，最省眼
git log --oneline -5       # 只看最近 5 条
```

### ④ 看某个文件改了什么

```bash
git diff                    # 看还没提交的改动
git diff 新代码/src/views/ForumView.vue    # 只看某个文件
git diff v0.1.0 --stat      # 从 v0.1.0 到现在的文件级变化
```

### ⑤ 改坏了想撤回去

```bash
# 情况一：改了还没提交，想恢复成上次提交的样子（会丢改动！）
git checkout -- 新代码/src/views/ForumView.vue    # 只还原这一个文件
git checkout -- .                                  # 还原所有文件

# 情况二：已经提交了但想撤销这次提交、代码保留
git reset --soft HEAD~1
```

### ⑥ 回到以前的版本看看，再回来

```bash
git checkout v0.1.0        # 回到首版（只读，别在这里改代码）
git switch main            # 回到最新
```

---

## 3. 写提交说明的小习惯

不用太正式，但尽量一句话说清“做了什么”：

| 例子 | 评价 |
| --- | --- |
| `迁移个人信息页` | ✅ 清楚 |
| `fix: 修复头像上传后不刷新` | ✅ 很好（`fix:` 表示修 bug，`feat:` 表示加功能） |
| `改了点东西` | ❌ 过两周自己也想不起来 |

再配上标签（tag）标记重要节点，比如答辩前打一版 `v1.0.0`：

```bash
git tag -a v0.2.0 -m "补完个人信息和个人空间"
```

---

## 4. 推送到 GitHub（已配置好）

远程仓库已经配好了：

```
origin  https://github.com/zlap730/qilwan-.git
```

因为这台电脑访问 GitHub 需要代理（Clash 开在 `127.0.0.1:7890`），已经在本仓库里配了：

```bash
git config --local http.proxy http://127.0.0.1:7890
git config --local https.proxy http://127.0.0.1:7890
```

> 注意：这是**只对本仓库生效**的配置，不动全局设置。用代理软件时记得让 Clash 保持开启。

### 第一次推送（需要登录一次 GitHub）

双击 **`推送到GitHub.cmd`**，会弹出一个登录窗口：

1. 选 `Sign in with your browser`（用浏览器登录）；
2. 浏览器里登录你的 `zlap730` 账号，点 `Authorize`；
3. 窗口关闭后会自动推送，看到 `[成功]` 即可。

也可以直接敲命令（弹窗是一样的）：

```bash
git push -u origin main --tags
```

> 登录凭据会被 Windows 凭据管理器记住，**以后推送不用再登录**。
> 如果提示要密码：GitHub 现在不接受账号密码，需要用 Personal Access Token
> （网站 Settings → Developer settings → Personal access tokens → Generate new token，勾选 `repo`），把令牌当密码粘贴。

### 以后每次同步只需要两行

```bash
git push            # 把本地提交推到 GitHub
git pull            # 把 GitHub 上的新提交拉到本地（换电脑时用）
```

---

## 4.5 用 Gitee（码云）备份的话

国内访问 Gitee 不需要代理，速度也快，可以同时配一个远程仓库做双备份：

```bash
git remote add gitee https://gitee.com/你的用户名/仓库名.git
git push gitee main --tags
```

之后 `git push origin main` 推 GitHub，`git push gitee main` 推 Gitee；想一次推两边可以 `git push origin main && git push gitee main`。

<!-- 以下是另一种协作方式，留作参考 -->

### 4.6 用桌面版客户端（可选，图形界面点按钮）

装一个 **GitHub Desktop**，登录账号后选 “Add existing repository”，选中 `C:\Users\19168\Desktop\骑乐网v0.0.1`，
之后提交、推送都点按钮即可，不需要记命令。

### 4.3 之后每次同步

```bash
git push            # 把本地提交推到网站
git pull            # 把网站上的新提交拉到本地（只在多台电脑/macOS 之间协作才用得到）
```

---

## 5. 常见报错对照表

| 你看到的提示 | 意思 | 怎么办 |
| --- | --- | --- |
| `nothing to commit, working tree clean` | 没有改动可提交 | 正常，说明已保存 |
| `npm` 无法加载 `npm.ps1` | PowerShell 禁止脚本 | 用 `npm.cmd` 或执行 `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |
| `fatal: not a git repository` | 不在仓库目录里 | 先 `cd C:\Users\19168\Desktop\骑乐网v0.0.1` |
| `Please tell me who you are` | 没配身份 | `git config user.name "名字"` 和 `git config user.email "邮箱"` |
| `error: failed to push some refs` | 远程已有提交，本地没有 | 先 `git pull --rebase` 再 `git push` |
| `LF will be replaced by CRLF` | Windows 换行符提示 | 无害，可以忽略 |
| `Your branch is ahead of 'origin/main' by 1 commit` | 本地有 1 条还没推送 | `git push` 即可 |

---

## 6. 这个仓库的特殊之处（别踩坑）

| 东西 | 状态 | 说明 |
| --- | --- | --- |
| `新代码/server/.env` | **没有进版本库** | 里面有数据库密码。换电脑克隆后，要把 `server/.env.example` 复制成 `.env` 再填密码 |
| `旧代码/video`、`旧代码/img` | **没有进版本库** | 合计 5 GB 多，太大。文件还在你硬盘上，只是 git 不管它们 |
| `新代码/server/uploads/*` | 没有进版本库 | 用户上传的图属于运行数据，只保留了 `default_avatar.png` |
| `新代码/node_modules`、`dist` | 没有进版本库 | 用 `npm install` / `npm run build` 能重新生成 |

所以：**本地怎么改都正常；换电脑后先 `npm install` 再补 `server/.env`。**

---

## 7. 从现在开始的推荐节奏

```
写完一块功能
   ↓
npm run dev 自己点一遍，确认没问题
   ↓
双击 提交.cmd → 选 1 → 输入一句说明      （或者 git add -A && git commit -m "…"）
   ↓
git push                                （配好远程之后）
```

一次提交只做一件事，说明写得具体一点，以后要回退或者写论文讲“开发过程”都方便。

---

## 8. 想系统学 git（可选）

- 可视化交互教程：<https://learngitbranching.js.org/?locale=zh_CN>（玩 20 分钟就懂分支和合并）
- 官方中文手册：<https://git-scm.com/book/zh/v2>（当字典查即可，不用通读）

---

## 附一：当前仓库状态速查

```bash
cd C:\Users\19168\Desktop\骑乐网v0.0.1
git log --oneline --decorate     # 现在能看到 f946fbb (HEAD -> main, tag: v0.1.0)
git status                       # 现在应该显示 clean
```

## 附二：新手最容易踩的 5 个坑

1. **在错误的目录敲 git 命令** —— 先在项目根目录确认 `git status` 不报 `not a git repository`。
2. **`git checkout -- .` 当撤销万能键** —— 它会还原所有未提交改动，且**无法恢复**。只想撤一个文件就写文件名。
3. **把 `.env` 提交上去** —— 本仓库已经在 `.gitignore` 里挡掉了；以后新建的密钥文件也要记得加进去。
4. **一次提交几百行改动、说明写“随便改改”** —— 出问题时没法定位，也没法单独回退。
5. **只在本地提交，从不 push** —— 提交只是在本地拍快照，硬盘坏了照样全没，一定要推送到 GitHub/Gitee。
