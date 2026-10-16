@echo off
chcp 936 >nul 2>&1
title Antigravity 极致瘦身版双模中文管理中心 一键脱机编译脚本
echo =======================================================
echo   Antigravity 双模中文管理中心 原生脱机编译流水线
echo   100% 原生零依赖 · 调用系统自带 csc.exe 脱机编译
echo   彻底剥离庞大 ASAR · 极速瘦身至 370KB 极致轻量化
echo =======================================================
echo.

set CSC=C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe

if not exist "%CSC%" (
    echo [错误] 未在系统中检测到 .NET Framework 4.0/4.8 编译器：
    echo %CSC%
    pause
    exit /b 1
)

echo [1/3] 正在校验核心资源文件...
if not exist "resources\app.ico" (
    echo [错误] 未找到 resources\app.ico 图标文件！
    pause
    exit /b 1
)
if not exist "resources\zh_engine_snippet.js" (
    echo [错误] 未找到 resources\zh_engine_snippet.js 纯内存与微创补丁注入引擎！
    pause
    exit /b 1
)
if not exist "src\ToolWindow.cs" (
    echo [错误] 未找到 src\ToolWindow.cs 源代码！
    pause
    exit /b 1
)

echo [2/3] 正在调用 csc.exe 编译生成单文件绿色程序...
if exist "AntigravityManager.exe" del /f /q "AntigravityManager.exe" >nul 2>&1
if exist "Antigravity汉化管理小工具.exe" del /f /q "Antigravity汉化管理小工具.exe" >nul 2>&1

"%CSC%" /target:winexe /platform:anycpu /optimize+ /codepage:65001 /utf8output /win32icon:resources\app.ico /resource:resources\zh_engine_snippet.js,zh_engine_snippet_js /out:AntigravityManager.exe src\ToolWindow.cs

if errorlevel 1 (
    echo.
    echo [失败] 编译失败，请检查报错日志！
    pause
    exit /b 1
)

move /y "AntigravityManager.exe" "Antigravity汉化管理小工具.exe" >nul 2>&1

echo.
echo [3/3] 编译成功！
echo 产物路径: %~dp0Antigravity汉化管理小工具.exe
echo.
pause
