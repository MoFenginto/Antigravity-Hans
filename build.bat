@echo off
chcp 936 >nul 2>&1
title Antigravity 汉化小工具 一键脱机编译脚本
echo =======================================================
echo   Antigravity 汉化管理小工具 原生脱机编译流水线
echo   100% 原生零依赖 · 系统自带 csc.exe 极速编译
echo   内嵌全量 2.27.0 深度补丁与出厂备份 · 单文件绿色交付
echo =======================================================
echo.

set CSC=C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe

if not exist "%CSC%" (
    echo [错误] 未在系统中检测到 .NET Framework 4.0/4.8 编译器
    echo %CSC%
    pause
    exit /b 1
)

echo [1/3] 校验依赖资源文件...
if not exist "resources\app.ico" (
    echo [错误] 未找到 resources\app.ico 图标文件！
    pause
    exit /b 1
)
if not exist "resources\zh_engine_snippet.js" (
    echo [错误] 未找到 resources\zh_engine_snippet.js 汉化引擎脚本！
    pause
    exit /b 1
)
if not exist "resources\sponsor_qr.png" (
    echo [错误] 未找到 resources\sponsor_qr.png 微信赞赏码！
    pause
    exit /b 1
)
if not exist "resources\app.asar.patched" (
    echo [错误] 未找到 resources\app.asar.patched 深度补丁归档！
    pause
    exit /b 1
)
if not exist "resources\app.asar.official_backup" (
    echo [错误] 未找到 resources\app.asar.official_backup 官方备份归档！
    pause
    exit /b 1
)
if not exist "src\ToolWindow.cs" (
    echo [错误] 未找到 src\ToolWindow.cs 源码！
    pause
    exit /b 1
)

echo [2/3] 正在调用 csc.exe 编译生成单文件可执行程序...
if exist "Antigravity-Hans-Manager.exe" del /f /q "Antigravity-Hans-Manager.exe" >nul 2>&1

"%CSC%" /target:winexe /platform:anycpu /optimize+ /codepage:65001 /utf8output /win32icon:resources\app.ico /resource:resources\app.asar.patched,core_patched_asar /resource:resources\app.asar.official_backup,core_official_backup /resource:resources\zh_engine_snippet.js,zh_engine_snippet_js /resource:resources\sponsor_qr.png,sponsor_qr_png /out:Antigravity-Hans-Manager.exe src\ToolWindow.cs

if errorlevel 1 (
    echo.
    echo [失败] 编译失败，请检查报错日志！
    pause
    exit /b 1
)

echo.
echo [3/3] 编译成功！
echo 输出文件: %~dp0Antigravity-Hans-Manager.exe
echo.
pause
