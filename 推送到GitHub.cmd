@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ==================================================
echo   把代码推送到 GitHub
echo   远程地址：https://github.com/zlap730/qilwan-.git
echo ==================================================
echo.
echo 接下来可能会弹出一个登录窗口（GitHub 登录 / 浏览器授权），
echo 在窗口里登录你的 zlap730 账号并点授权即可，本窗口会自动继续。
echo.

set GIT_TERMINAL_PROMPT=0
set GCM_INTERACTIVE=always
set GCM_PROVIDER=github
set GCM_ALLOW_WINDOWS_ACCOUNT_MANAGER=false

git push -u origin main --tags

if errorlevel 1 (
  echo.
  echo [失败] 推送没有成功，把上面的英文报错截图发给我。
) else (
  echo.
  echo [成功] 代码已经推送到 GitHub：
  echo   https://github.com/zlap730/qilwan-
  echo.
  echo 以后每次改完，先运行「提交.cmd」提交，再双击本文件推送即可。
)
echo.
pause
