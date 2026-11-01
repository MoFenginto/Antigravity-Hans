# ==============================================================================
# Google Antigravity 官方客户端 Windows 一键静默汉化配置脚本 (PowerShell)
# 项目主页: https://github.com/MoFenginto/Antigravity-Hans
# 支持环境: Windows 10 / Windows 11 (PowerShell 5.1 & PowerShell 7+)
# ==============================================================================

[CmdletBinding()]
param (
    [switch]$Restore,
    [string]$CustomResourcesPath = ""
)

$ErrorActionPreference = "Stop"

$Repo = "MoFenginto/Antigravity-Hans"
$Tag = "v2.0.0"
$AsarName = "app.asar"

$PrimaryUrl = "https://github.com/$Repo/releases/download/$Tag/$AsarName"
$MirrorUrl = "https://ghproxy.net/https://github.com/$Repo/releases/download/$Tag/$AsarName"

Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "   Google Antigravity 官方客户端 Windows 一键汉化配置脚本           " -ForegroundColor Cyan
Write-Host "   开源项目主页: https://github.com/$Repo                           " -ForegroundColor Cyan
Write-Host "====================================================================" -ForegroundColor Cyan

# 自动寻找 resources 目录
function Get-AntigravityResourcesPath {
    if (![string]::IsNullOrEmpty($CustomResourcesPath) -and (Test-Path $CustomResourcesPath)) {
        return $CustomResourcesPath
    }

    $candidates = @(
        "$env:LOCALAPPDATA\Programs\antigravity\resources",
        "$env:ProgramFiles\Antigravity\resources",
        "${env:ProgramFiles(x86)}\Antigravity\resources",
        "$env:APPDATA\Programs\antigravity\resources"
    )

    foreach ($path in $candidates) {
        if ((Test-Path $path) -and (Test-Path (Join-Path $path "app.asar"))) {
            return $path
        }
    }
    return $null
}

$targetPath = Get-AntigravityResourcesPath

if ([string]::IsNullOrEmpty($targetPath)) {
    Write-Host "[!] 未能在系统默认路径中检测到 Antigravity 客户端 resources 目录。" -ForegroundColor Red
    Write-Host "[?] 请手动指定路径运行，例如: .\install.ps1 -CustomResourcesPath 'D:\Path\To\resources'" -ForegroundColor Yellow
    exit 1
}

Write-Host "[*] 锁定应用程序资源目录: $targetPath" -ForegroundColor Green

$asarFile = Join-Path $targetPath "app.asar"
$backupFile = Join-Path $targetPath "app.asar.official_backup"

# 还原逻辑
if ($Restore) {
    Write-Host "[*] 正在执行恢复官方英文原版操作..." -ForegroundColor Yellow
    if (!(Test-Path $backupFile)) {
        Write-Host "[!] 未检测到官方出厂备份文件 ($backupFile)，无法自动还原！" -ForegroundColor Red
        exit 1
    }
    Copy-Item -Path $backupFile -Destination $asarFile -Force
    Write-Host "[+] 还原成功！Antigravity 客户端已完整恢复为出厂官方原版状态。" -ForegroundColor Green
    exit 0
}

# 进程检测
$running = Get-Process -Name "antigravity" -ErrorAction SilentlyContinue
if ($running) {
    Write-Host "[!] 检测到 Antigravity 客户端正在运行中。" -ForegroundColor Yellow
    Write-Host "[*] 为避免文件占用导致操作失败，请关闭客户端后再运行本脚本。" -ForegroundColor Yellow
    $confirm = Read-Host "是否需要脚本尝试安全退出 Antigravity 进程？(Y/N)"
    if ($confirm -match '^[Yy]') {
        Stop-Process -Name "antigravity" -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    } else {
        Write-Host "[!] 已取消操作，请手动退出客户端后重试。" -ForegroundColor Red
        exit 1
    }
}

# 建立出厂备份
if (!(Test-Path $backupFile)) {
    Write-Host "[*] 正在创建官方原版备份: $backupFile" -ForegroundColor Cyan
    Copy-Item -Path $asarFile -Destination $backupFile -Force
    Write-Host "[+] 官方出厂备份已妥善建立。" -ForegroundColor Green
} else {
    Write-Host "[*] 官方出厂备份已存在，跳过备份步骤。" -ForegroundColor Gray
}

# 临时下载
$tempDir = Join-Path $env:TEMP ("antigravity_hans_" + [System.Guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
$tempAsar = Join-Path $tempDir "app.asar"

try {
    Write-Host "[*] 正在从 GitHub Release 下载深度汉化核心..." -ForegroundColor Cyan
    $downloaded = $false

    # 尝试官方直连
    try {
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12
        $webClient = New-Object System.Net.WebClient
        $webClient.Headers.Add("User-Agent", "Mozilla/5.0")
        $webClient.DownloadFile($PrimaryUrl, $tempAsar)
        $downloaded = $true
    } catch {
        Write-Host "[!] 官方主链接下载缓慢或受限，正在自动切换备用加速镜像..." -ForegroundColor Yellow
    }

    # 尝试镜像
    if (!$downloaded) {
        try {
            $webClient.DownloadFile($MirrorUrl, $tempAsar)
            $downloaded = $true
        } catch {
            Write-Host "[!] 镜像加速链接下载失败: $_" -ForegroundColor Red
        }
    }

    if (!$downloaded -or !(Test-Path $tempAsar)) {
        Write-Host "[!] 核心补丁文件下载失败，请检查网络连接。" -ForegroundColor Red
        exit 1
    }

    # 校验文件大小 (必须大于 4MB)
    $fileSize = (Get-Item $tempAsar).Length
    if ($fileSize -lt 4000000) {
        Write-Host "[!] 下载的文件大小异常 ($fileSize 字节)，校验未通过，终止安装。" -ForegroundColor Red
        exit 1
    }

    Write-Host "[+] 核心补丁校验成功 (体积: $([math]::Round($fileSize/1MB, 2)) MB)。" -ForegroundColor Green

    # 原子就地覆盖
    Write-Host "[*] 正在部署汉化核心..." -ForegroundColor Cyan
    Copy-Item -Path $tempAsar -Destination $asarFile -Force
    Write-Host "====================================================================" -ForegroundColor Cyan
    Write-Host "   Google Antigravity 官方客户端纯中文汉化配置已全部圆满完成！       " -ForegroundColor Green
    Write-Host "   现在启动 Antigravity 即可尽享 100% 深度中文体验！                " -ForegroundColor Green
    Write-Host "====================================================================" -ForegroundColor Cyan
} finally {
    if (Test-Path $tempDir) {
        Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}
