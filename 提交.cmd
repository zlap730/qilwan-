@echo off
chcp 65001 >nul
rem 骑乐网 —— 日常提交小助手（git 的图形化替代，免得记命令）
rem 用法：双击运行，按提示选 1/2/3/4 即可
cd /d "%~dp0"

echo ============================================
echo   骑乐网 - 日常提交助手
echo   当前目录：%CD%
echo ============================================

git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
  echo [错误] 这里不是 git 仓库目录
  pause
  exit /b 1
)

git status --short
echo.
echo --------------------------------------------
echo  1. 提交这次所有改动（推荐，最常用）
echo  2. 看看这一版改了什么（不提交）
echo  3. 撤销我还没提交的改动（危险，会丢代码）
echo  4. 退出
echo --------------------------------------------
set /p choice=请输入序号后回车：

if "%choice%"=="1" goto :commit
if "%choice%"=="2" goto :diff
if "%choice%"=="3" goto :undo
goto :eof

:commit
set /p msg=请输入本次改动说明（例如：迁移个人信息页）：
if "%msg%"=="" (
  echo [提示] 说明不能为空，已取消
  pause
  exit /b 1
)
git add -A
git commit -m "%msg%"
if errorlevel 1 (
  echo.
  echo [提示] 没有可提交的改动，啥也没做
) else (
  echo.
  echo [完成] 已提交。历史如下：
  git log --oneline -5
)
pause
goto :eof

:diff
git status
echo.
echo ---- 具体改动（按 q 退出查看）----
git diff
pause
goto :eof

:undo
echo.
echo [警告] 这会把这些文件的改动全部还原成上次提交的样子，且无法恢复：
git status --short
echo.
set /p ok=确定撤销吗？输入 YES 继续，其它任意键取消：
if /i not "%ok%"=="YES" (
  echo 已取消
  pause
  exit /b 0
)
git checkout -- .
echo [完成] 已撤销未提交的改动
pause
goto :eof
