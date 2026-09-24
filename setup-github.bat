@echo off
rem One-time setup: turns this folder into a git repo and pushes it to GitHub.
rem Usage (Windows): double-click this file, or run it from this folder.
cd /d "%~dp0"
set REMOTE=https://github.com/mertJF/matteflux.git

where git >nul 2>nul
if errorlevel 1 (
  echo Git is not installed. Get it from https://git-scm.com/downloads and run this again.
  pause
  exit /b 1
)

for /f "delims=" %%i in ('git config --global user.name') do set GN=%%i
for /f "delims=" %%i in ('git config --global user.email') do set GE=%%i
if "%GN%"=="" (
  set /p GN=Git needs your name for commits: 
  call git config --global user.name "%%GN%%"
)
if "%GE%"=="" (
  set /p GE=Email on your GitHub account: 
  call git config --global user.email "%%GE%%"
)

if not exist .git git init -q
git add .
git diff --cached --quiet || git commit -q -m "Site, Set 01 and production tools"
git branch -M main
git remote get-url origin >nul 2>nul || git remote add origin %REMOTE%

echo Pushing to %REMOTE% ...
echo If a browser window or login prompt opens, sign in to GitHub there.
git push -u origin main
echo Done.
pause
