#!/usr/bin/env bash
# ==============================================================================
# Google Antigravity 官方客户端全平台一键汉化脚本 (Linux / macOS)
# 项目主页: https://github.com/MoFenginto/Antigravity-Hans
# 支持系统: Ubuntu, Debian, Arch Linux, Fedora, CentOS, openSUSE 以及 macOS (Apple Silicon / Intel)
# ==============================================================================

set -e

REPO="MoFenginto/Antigravity-Hans"
TAG="v2.0.0"
ASAR_NAME="app.asar"

# 官方与镜像源配置
PRIMARY_URL="https://github.com/${REPO}/releases/download/${TAG}/${ASAR_NAME}"
MIRROR_URL="https://ghproxy.net/https://github.com/${REPO}/releases/download/${TAG}/${ASAR_NAME}"

# 控制台颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}====================================================================${NC}"
echo -e "${BLUE}   Google Antigravity 全平台一键纯中文汉化配置脚本 (Linux / macOS)   ${NC}"
echo -e "${BLUE}   开源主页: https://github.com/${REPO}                         ${NC}"
echo -e "${BLUE}====================================================================${NC}"

# 检测操作系统
OS_TYPE="$(uname -s)"
case "${OS_TYPE}" in
    Linux*)     SYSTEM_NAME="Linux" ;;
    Darwin*)    SYSTEM_NAME="macOS" ;;
    *)          SYSTEM_NAME="Unknown" ;;
esac

echo -e "${BLUE}[*] 当前操作系统检测结果: ${GREEN}${SYSTEM_NAME} (${OS_TYPE})${NC}"

# 寻址 Antigravity resources 目录
find_resources_dir() {
    # 优先检查用户指定的第一个参数
    if [ -n "$1" ] && [ -d "$1" ]; then
        echo "$1"
        return
    fi

    local candidates=()

    if [ "${SYSTEM_NAME}" = "macOS" ]; then
        candidates+=(
            "/Applications/Antigravity.app/Contents/Resources"
            "${HOME}/Applications/Antigravity.app/Contents/Resources"
        )
    else
        # Linux 常见候选路径
        candidates+=(
            "/opt/Antigravity/resources"
            "/opt/antigravity/resources"
            "/usr/lib/antigravity/resources"
            "/usr/lib/Antigravity/resources"
            "/usr/share/antigravity/resources"
            "/usr/share/Antigravity/resources"
            "${HOME}/.local/share/antigravity/resources"
            "${HOME}/.local/share/Antigravity/resources"
            "/var/lib/flatpak/app/com.google.antigravity/current/active/files/resources"
            "${HOME}/.local/share/flatpak/app/com.google.antigravity/current/active/files/resources"
        )
    fi

    for dir in "${candidates[@]}"; do
        if [ -d "${dir}" ] && [ -f "${dir}/app.asar" ]; then
            echo "${dir}"
            return
        fi
    done

    echo ""
}

TARGET_DIR="$(find_resources_dir "$1")"

if [ -z "${TARGET_DIR}" ]; then
    echo -e "${RED}[!] 未能在默认路径中检测到 Antigravity 客户端 resources 目录。${NC}"
    echo -e "${YELLOW}[?] 请手动传入 resources 绝对路径执行，例如:${NC}"
    if [ "${SYSTEM_NAME}" = "macOS" ]; then
        echo -e "    bash $0 /Applications/Antigravity.app/Contents/Resources"
    else
        echo -e "    bash $0 /opt/Antigravity/resources"
    fi
    exit 1
fi

echo -e "${BLUE}[*] 锁定目标程序资源目录: ${GREEN}${TARGET_DIR}${NC}"

# 还原模式判断
if [ "$1" = "restore" ] || [ "$2" = "restore" ] || [ "$1" = "--restore" ]; then
    echo -e "${YELLOW}[*] 进入官方原版还原模式...${NC}"
    BACKUP_FILE="${TARGET_DIR}/app.asar.official_backup"
    if [ ! -f "${BACKUP_FILE}" ]; then
        echo -e "${RED}[!] 未找到官方原版备份文件 (${BACKUP_FILE})，无法自动还原！${NC}"
        exit 1
    fi
    cp -f "${BACKUP_FILE}" "${TARGET_DIR}/app.asar"
    echo -e "${GREEN}[+] 还原成功！Antigravity 现已恢复为出厂官方英文原版。${NC}"
    exit 0
fi

# 检查进程运行状态
check_process() {
    if pgrep -fi "antigravity" > /dev/null 2>&1; then
        echo -e "${YELLOW}[!] 检测到 Antigravity 正在运行中。${NC}"
        echo -e "${YELLOW}[*] 为确保文件句柄释放并防止文件冲突，请先完全退出 Antigravity 客户端。${NC}"
        read -r -p "是否需要脚本尝试自动退出客户端进程？(y/N): " choice
        case "$choice" in 
            y|Y ) 
                pkill -fi "antigravity" || true
                sleep 2
                ;;
            * ) 
                echo -e "${RED}[!] 用户取消操作，请手动退出程序后重新运行本脚本。${NC}"
                exit 1
                ;;
        esac
    fi
}

check_process

# 备份原版文件
ASAR_FILE="${TARGET_DIR}/app.asar"
BACKUP_FILE="${TARGET_DIR}/app.asar.official_backup"

if [ ! -f "${BACKUP_FILE}" ]; then
    echo -e "${BLUE}[*] 首次安装，正在建立官方原版出厂备份...${NC}"
    cp -p "${ASAR_FILE}" "${BACKUP_FILE}"
    echo -e "${GREEN}[+] 官方出厂备份已妥善建立: ${BACKUP_FILE}${NC}"
else
    echo -e "${GREEN}[*] 官方出厂备份已存在，跳过备份。${NC}"
fi

# 下载汉化核心
TMP_DIR="$(mktemp -d /tmp/antigravity_hans_XXXXXX)"
TMP_ASAR="${TMP_DIR}/app.asar"

cleanup() {
    rm -rf "${TMP_DIR}"
}
trap cleanup EXIT

echo -e "${BLUE}[*] 正在下载汉化核心补丁 (来自 GitHub Release)...${NC}"

download_success=0

# 优先使用 curl 下载
if command -v curl > /dev/null 2>&1; then
    if curl -fL --connect-timeout 10 --retry 2 -o "${TMP_ASAR}" "${PRIMARY_URL}"; then
        download_success=1
    else
        echo -e "${YELLOW}[!] 官方主链接下载缓慢或受限，正在自动切换备用加速镜像...${NC}"
        if curl -fL --connect-timeout 15 -o "${TMP_ASAR}" "${MIRROR_URL}"; then
            download_success=1
        fi
    fi
elif command -v wget > /dev/null 2>&1; then
    if wget --timeout=10 --tries=2 -O "${TMP_ASAR}" "${PRIMARY_URL}"; then
        download_success=1
    else
        echo -e "${YELLOW}[!] 官方主链接下载缓慢或受限，正在自动切换备用加速镜像...${NC}"
        if wget --timeout=15 -O "${TMP_ASAR}" "${MIRROR_URL}"; then
            download_success=1
        fi
    fi
else
    echo -e "${RED}[!] 系统中未检测到 curl 或 wget 工具，请先安装。${NC}"
    exit 1
fi

if [ ${download_success} -ne 1 ] || [ ! -s "${TMP_ASAR}" ]; then
    echo -e "${RED}[!] 汉化核心文件下载失败，请检查网络连接或稍后重试。${NC}"
    exit 1
fi

# 检查下载文件大小 (正常应在 4MB 以上)
FILE_SIZE=$(wc -c < "${TMP_ASAR}" | tr -d ' ')
if [ "${FILE_SIZE}" -lt 4000000 ]; then
    echo -e "${RED}[!] 下载的文件大小异常 (${FILE_SIZE} 字节)，校验未通过，终止安装。${NC}"
    exit 1
fi

echo -e "${GREEN}[+] 核心补丁校验成功 (体积: $((FILE_SIZE / 1024 / 1024)) MB)。${NC}"

# 覆盖安装 (检查权限)
echo -e "${BLUE}[*] 正在将汉化补丁写入应用程序资源目录...${NC}"

if [ -w "${TARGET_DIR}" ]; then
    cp -f "${TMP_ASAR}" "${ASAR_FILE}"
else
    echo -e "${YELLOW}[*] 目标目录需要系统管理权限，正在请求 sudo...${NC}"
    sudo cp -f "${TMP_ASAR}" "${ASAR_FILE}"
fi

echo -e "${BLUE}====================================================================${NC}"
echo -e "${GREEN}   Google Antigravity 官方客户端纯中文汉化配置已全部圆满完成！       ${NC}"
echo -e "${GREEN}   您现在可以重新启动 Antigravity 客户端，尽享 100% 深度中文体验。   ${NC}"
echo -e "${BLUE}====================================================================${NC}"
