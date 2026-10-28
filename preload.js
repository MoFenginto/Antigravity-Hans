"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Preload script — runs in every BrowserWindow before the page loads.
 * Exposes a minimal, secure API via contextBridge so the renderer can
 * communicate with the main-process auto-updater without nodeIntegration.
 */
const electron_1 = require("electron");
const updaterAPI = {
    onStateChanged: (callback) => {
        const handler = (_event, state) => {
            callback(state);
        };
        electron_1.ipcRenderer.on('updater:state-changed', handler);
        // Return unsubscribe function
        return () => {
            electron_1.ipcRenderer.removeListener('updater:state-changed', handler);
        };
    },
    applyUpdate: () => electron_1.ipcRenderer.invoke('updater:apply'),
    quitAndInstall: () => electron_1.ipcRenderer.invoke('updater:quit-and-install'),
    checkForUpdates: () => electron_1.ipcRenderer.invoke('updater:check-for-updates'),
    getState: () => electron_1.ipcRenderer.invoke('updater:get-state'),
};
const dialogAPI = {
    showOpenDialog: () => electron_1.ipcRenderer.invoke('dialog:open-workspace'),
    showOpenMultipleFolderDialog: () => electron_1.ipcRenderer.invoke('dialog:open-workspaces'),
};
const notificationAPI = {
    send: (options) => electron_1.ipcRenderer.invoke('notification:send', options),
    openSystemPreferences: () => electron_1.ipcRenderer.invoke('notification:open-system-preferences'),
    onClicked: (callback) => {
        const handler = (_event, payload) => {
            callback(payload);
        };
        electron_1.ipcRenderer.on('notification:clicked', handler);
        return () => {
            electron_1.ipcRenderer.removeListener('notification:clicked', handler);
        };
    },
};
const storageAPI = {
    getItems: () => electron_1.ipcRenderer.invoke('storage:get-items'),
    updateItems: (changes) => electron_1.ipcRenderer.invoke('storage:update-items', changes),
    onChanged: (callback) => {
        const handler = (_event, changes) => {
            callback(changes);
        };
        electron_1.ipcRenderer.on('storage:changed', handler);
        return () => {
            electron_1.ipcRenderer.removeListener('storage:changed', handler);
        };
    },
};
const logsAPI = {
    getElectronLogs: () => electron_1.ipcRenderer.invoke('logs:electron'),
};
const extensionsAPI = {
    sendAuthorities: (authoritiesMap) => electron_1.ipcRenderer.invoke('extensions:send-authorities', authoritiesMap),
};
const deepLinkAPI = {
    onDeepLink: (callback) => {
        const handler = (_event, url) => {
            callback(url);
        };
        electron_1.ipcRenderer.on('deep-link', handler);
        return () => {
            electron_1.ipcRenderer.removeListener('deep-link', handler);
        };
    },
    getStoredDeepLink: () => electron_1.ipcRenderer.invoke('deep-link:get-stored'),
};
const agentAPI = {
    updateActiveAgentCount: (count) => electron_1.ipcRenderer.invoke('agent:update-active-count', count),
};

const zhNativeContextMenuMap = {
    'Rename': '重命名',
    'Rename This Conversation': '重命名此对话',
    'Pin': '置顶',
    'Unpin': '取消置顶',
    'Pin This Conversation': '置顶此对话',
    'Unpin This Conversation': '取消置顶此对话',
    'Mark Unread': '标记为未读',
    'Mark as Unread': '标记为未读',
    'Mark This Conversation as Unread': '将此对话标记为未读',
    'Mark as Read': '标记为已读',
    'Mark All as Read': '全部标记为已读',
    'Mark This Conversation as Read': '将此对话标记为已读',
    'Archive': '归档',
    'Archive This Conversation': '归档此对话',
    'Archive project': '归档项目',
    'Archive Workspace': '归档工作区',
    'Archive / Restore': '归档 / 恢复',
    'Delete': '删除',
    'Delete Conversation': '删除对话',
    'Delete Permanently': '永久删除',
    'Delete Project': '删除项目',
    'Delete Handler': '删除处理器',
    'Delete Hook': '删除钩子',
    'Delete Task': '删除任务',
    'Copy Project Name': '复制项目名称',
    'Project Settings': '项目设置',
    'Show in File Explorer': '在文件资源管理器中显示',
    'Create Project': '创建项目',
    'New Project': '新建项目',
    'New Remote Project': '新建远程项目',
    'Group By Project': '按项目分组',
    'Sidebar grouped by project': '侧边栏按项目分组',
    'Updated sidebar grouping': '更新侧边栏分组',
    'Copy': '复制',
    'Cut': '剪切',
    'Paste': '粘贴',
    'Select All': '全选',
    'Quote Selection': '引用选中文本',
    'Comment on Selection': '批注选中文本',
    'Copy Message': '复制消息',
    'Copy Conversation Markdown': '复制对话为 Markdown',
    'Copy Conversation ID': '复制对话 ID',
    'Copy File Name': '复制文件名',
    'Copy File Path': '复制文件路径',
    'Copy Path': '复制路径',
    'Copy Link': '复制链接',
    'Copy Link Address': '复制链接地址',
    'Copy Image': '复制图片',
    'Copy Image Address': '复制图片地址',
    'Copy Config File Path': '复制配置文件路径',
    'Copy Trajectory ID': '复制轨迹 ID',
    'Copy debug info': '复制调试信息',
    'Split': '拆分',
    'Split Right': '向右拆分',
    'Split Down': '向下拆分',
    'Split Terminal': '拆分终端',
    'Split Conversation Horizontally': '水平拆分对话',
    'Split Conversation Vertically': '垂直拆分对话',
    'Equalize Split Panes': '均分拆分窗格',
    'Remove from Split': '从拆分中移除',
    'Close': '关闭',
    'Close Tab': '关闭标签页',
    'Close Other Tabs': '关闭其他标签页',
    'Close Tabs to the Right': '关闭右侧标签页',
    'Close Terminal Tab': '关闭终端标签页',
    'New Terminal Tab': '新建终端标签页',
    'Open': '打开',
    'Open Command Palette': '打开命令面板',
    'Open Commit Graph': '打开提交图',
    'Open Conversation': '打开对话',
    'Open Conversation History': '打开对话历史',
    'Open Conversation Picker': '打开对话选择器',
    'Open File Search': '打开文件搜索',
    'Open Folder': '打开文件夹',
    'Open Folder (Interactive)': '打开文件夹 (交互式)',
    'Open Image in New Tab': '在新标签页中打开图片',
    'Open Keyboard Shortcuts': '打开键盘快捷键',
    'Open Link in External Browser': '在外部浏览器中打开链接',
    'Open Link in New Tab': '在新标签页中打开链接',
    'Open in Built-in Browser': '在内置浏览器中打开',
    'Open in Code Search': '在代码搜索中打开',
    'Open in External Browser': '在外部浏览器中打开',
    'Open in Preview Pane': '在预览面板中打开',
    'Open in Preview Tab': '在预览标签页中打开',
    'Open with External Browser': '使用外部浏览器打开',
    'Open Preferences': '打开偏好设置',
    'Open Settings': '打开设置',
    'Open Trajectory Debug View': '打开轨迹调试视图',
    'Open Workspace Selector': '打开工作区选择器',
    'Terminal: Add to Chat': '终端：添加到对话',
    'Terminal Command Auto Execution': '终端命令自动执行',
    'Terminal Commands': '终端命令',
    'Allow List Terminal Commands': '白名单终端命令',
    'Deny List Terminal Commands': '黑名单终端命令',
    'Enable Terminal Sandbox': '启用终端沙箱',
    'Enable Sandbox Mode (Preview)': '启用沙箱模式 (预览)',
    'Browser Javascript Execution Policy': '浏览器 JavaScript 执行策略',
    'Plan Review Policy': '计划审查策略',
    'Review Policy': '审查策略',
    'Request Review': '请求审查',
    'Review': '审查',
    'More options': '更多选项',
    'Pin conversation': '置顶对话',
    'Archive conversation': '归档对话',
    'Delete conversation': '删除对话',
    'Advanced Settings': '高级设置',
    'Reload': '重新加载',
    'Overview': '概览',
    'Markdown Artifact Width': 'Markdown 产物宽度',
    'Select Model': '选择模型',
    'Select another model': '选择其他模型',
    'Select Next Conversation': '选择下一个对话',
    'Select Previous Conversation': '选择上一个对话',
    'Toggle Environment Selector': '切换环境选择器',
    'Toggle File Viewer': '切换文件查看器',
    'Toggle Model Selector': '切换模型选择器',
    'Toggle Overview Panel': '切换概览面板',
    'Toggle Project Selector': '切换项目选择器',
    'Toggle Terminal': '切换终端',
    'Refresh gcert Credentials': '刷新 gcert 凭据',
    'Marketing Emails': '营销邮件',
    'Marketplace': '插件市场'
};

function translateNativeContextMenu(items) {
    if (!Array.isArray(items)) return items;
    return items.map(item => {
        if (!item || typeof item !== 'object') return item;
        const copy = Object.assign({}, item);
        if (typeof copy.label === 'string') {
            const trimmed = copy.label.trim();
            if (zhNativeContextMenuMap[trimmed]) {
                copy.label = copy.label.replace(trimmed, zhNativeContextMenuMap[trimmed]);
            }
        }
        if (Array.isArray(copy.submenu)) {
            copy.submenu = translateNativeContextMenu(copy.submenu);
        }
        return copy;
    });
}

const electronNativeAPI = {
    getZoomLevel: () => electron_1.webFrame.getZoomFactor(),
    getPathForFile: (file) => electron_1.webUtils.getPathForFile(file),
    setTitleBarOverlay: (options) => electron_1.ipcRenderer.invoke('window:set-title-bar-overlay', options),
    minimize: () => electron_1.ipcRenderer.invoke('window:minimize'),
    maximize: () => electron_1.ipcRenderer.invoke('window:maximize'),
    unmaximize: () => electron_1.ipcRenderer.invoke('window:unmaximize'),
    isMaximized: () => electron_1.ipcRenderer.invoke('window:is-maximized'),
    close: () => electron_1.ipcRenderer.invoke('window:close'),
    toggleDevTools: () => electron_1.ipcRenderer.invoke('window:toggle-devtools'),
    zoomIn: () => {
        void electron_1.ipcRenderer.invoke('window:zoom-in');
    },
    zoomOut: () => {
        void electron_1.ipcRenderer.invoke('window:zoom-out');
    },
    resetZoom: () => {
        void electron_1.ipcRenderer.invoke('window:reset-zoom');
    },
    openExternal: (url) => electron_1.ipcRenderer.invoke('shell:open-external', url),
    revealInFilePicker: (path) => electron_1.ipcRenderer.invoke('shell:reveal-in-file-picker', path),
    showContextMenu: (items) => {
        return electron_1.ipcRenderer.invoke('window:show-context-menu', typeof translateNativeContextMenu === 'function' ? translateNativeContextMenu(items) : items);
    },
    closeContextMenu: () => electron_1.ipcRenderer.invoke('window:close-context-menu'),
};
const ideAPI = {
    isInstalled: () => electron_1.ipcRenderer.invoke('ide:is-installed'),
};
const wslAPI = {
    getState: () => electron_1.ipcRenderer.invoke('wsl:get-state'),
    connect: (distro) => electron_1.ipcRenderer.invoke('wsl:connect', distro),
};
electron_1.contextBridge.exposeInMainWorld('electronUpdater', updaterAPI);
electron_1.contextBridge.exposeInMainWorld('dialog', dialogAPI);
electron_1.contextBridge.exposeInMainWorld('nativeNotifications', notificationAPI);
electron_1.contextBridge.exposeInMainWorld('nativeStorage', storageAPI);
electron_1.contextBridge.exposeInMainWorld('logs', logsAPI);
electron_1.contextBridge.exposeInMainWorld('extensions', extensionsAPI);
electron_1.contextBridge.exposeInMainWorld('deepLink', deepLinkAPI);
electron_1.contextBridge.exposeInMainWorld('agent', agentAPI);
electron_1.contextBridge.exposeInMainWorld('electronNative', electronNativeAPI);
electron_1.contextBridge.exposeInMainWorld('ide', ideAPI);
electron_1.contextBridge.exposeInMainWorld('wsl', wslAPI);



/* __ANTIGRAVITY_ZH_ENGINE_V2__ */
// Antigravity 纯内存静默汉化引擎 (Zero-FOUC Instant In-Memory Engine)
/* __ANTIGRAVITY_ZH_ENGINE_V2__ */
// ============================================================================
// Antigravity 100% 全量纯中文零闪烁即时汉化引擎 (Zero-FOUC Instant Localization)
// (原生节点创建拦截 + 属性拦截 + 微任务同步观察 + 长词绝对优先 + 零破坏防护)
// ============================================================================
try {
  (function() {
    if (typeof window === 'undefined') return;
    if (window.__antigravityStandaloneZhInstalled) return;
    window.__antigravityStandaloneZhInstalled = true;

    // 1. 严格按字符长度降序排序的词典数据占位符
    const rawPhrases = [
  [
    "Extensions",
    "扩展"
  ],
  [
    "Android Compose Preview",
    "Android Compose 预览"
  ],
  [
    "Android Device Hub",
    "Android 设备中心"
  ],
  [
    "Goals",
    "目标"
  ],
  [
    "Search tabs, files, extensions, subagents, artifacts",
    "搜索标签页、文件、扩展、子智能体、产物"
  ],
  [
    "Search tabs, files, extensions, subagents",
    "搜索标签页、文件、扩展、子智能体"
  ],
  [
    "Browser",
    "浏览器"
  ],
  [
    "Learning Proposal",
    "学习提案"
  ],
  [
    "Video Publish Plan Bilibili Douyin",
    "B站与抖音视频发布计划"
  ],
  [
    "Auto Localization Plan",
    "自动汉化方案"
  ],
  [
    "Walkthrough",
    "操作指引"
  ],
  [
    "subagents",
    "子智能体"
  ],
  [
    "subagent",
    "子智能体"
  ],
  [
    "Permission Preset",
    "权限预设"
  ],
  [
    "Auto (Preview)",
    "自动 (预览版)"
  ],
  [
    "Automatically decide if commands run.",
    "自动判断是否运行命令。"
  ],
  [
    "Automatically decide if commands run",
    "自动判断是否运行命令"
  ],
  [
    "Give Feedback",
    "问题反馈"
  ],
  [
    "Turbo",
    "极速模式"
  ],
  [
    "Notifications",
    "通知"
  ],
  [
    "Show system notifications when your action is needed or the agent finishes.",
    "当需要您操作或智能体完成任务时显示系统通知。"
  ],
  [
    "Show system notifications when your action is needed or the agent finishes",
    "当需要您操作或智能体完成任务时显示系统通知"
  ],
  [
    "Sound",
    "提示音"
  ],
  [
    "Play a sound when your action is needed or the agent finishes.",
    "当需要您操作或智能体完成任务时播放提示音。"
  ],
  [
    "Play a sound when your action is needed or the agent finishes",
    "当需要您操作或智能体完成任务时播放提示音"
  ],
  [
    "Volume:",
    "音量："
  ],
  [
    "Volume",
    "音量"
  ],
  [
    "Set the volume of agent sounds.",
    "设置智能体提示音的音量。"
  ],
  [
    "Set the volume of agent sounds",
    "设置智能体提示音的音量"
  ],
  [
    "Weekly Limit",
    "每周额度"
  ],
  [
    "Five Hour Limit",
    "5 小时额度"
  ],
  [
    "Weekly Limit 剩余",
    "每周额度 剩余"
  ],
  [
    "Five Hour Limit 剩余",
    "5 小时额度 剩余"
  ],
  [
    "it will fully refresh in",
    "将在以下时间完全刷新："
  ],
  [
    "fully refresh in",
    "完全刷新时间："
  ],
  [
    "Compact the conversation now (summarize history to free up the context window).",
    "立即压缩当前会话（总结历史以释放上下文空间）。"
  ],
  [
    "Compact the conversation now (summarize history to free up the context window)",
    "立即压缩当前会话（总结历史以释放上下文空间）"
  ],
  [
    "Plan carefully before executing a task.",
    "在执行任务前先周密制定计划。"
  ],
  [
    "Plan carefully before executing a task",
    "在执行任务前先周密制定计划"
  ],
  [
    "Save a new learning or customization.",
    "保存新学到的经验或自定义规则。"
  ],
  [
    "Persist new learnings and customize agent behavior.",
    "持久化沉淀新经验并自定义智能体行为。"
  ],
  [
    "Run tasks with deep reasoning and verification.",
    "启用深度推理与严密核验模式运行任务。"
  ],
  [
    "Create a scheduled background automation.",
    "创建周期性后台自动化任务。"
  ],
  [
    "Manage and configure plugins.",
    "管理与配置插件。"
  ],
  [
    "Pin conversation",
    "置顶对话"
  ],
  [
    "Archive conversation",
    "归档此对话"
  ],
  [
    "Unarchive conversation",
    "取消归档对话"
  ],
  [
    "More options",
    "更多选项"
  ],
  [
    "Readme",
    "自述文件"
  ],
  [
    "Plugin metadata",
    "插件元数据"
  ],
  [
    "This is a preview of the plugin's source. Nothing below is active until you install it.",
    "此为插件源码预览。在您安装之前，下方的任何功能均未激活。"
  ],
  [
    "Antigravity plugins marketplace catalog.",
    "Antigravity 官方插件市场目录。"
  ],
  [
    "Book 30 minutes with Priya and Sam next week",
    "下周与 Priya 和 Sam 预约 30 分钟会议"
  ],
  [
    "What's on my calendar today? Flag any conflicts",
    "今天我的日历上有什么安排？标出任何日程冲突"
  ],
  [
    "Block focus time before Friday's launch review",
    "在周五发布评审之前锁定一段专注时间"
  ],
  [
    "Summarize this design doc and list the open questions",
    "总结此设计文档并列出未决问题"
  ],
  [
    "Draft a launch announcement in a new doc from my notes",
    "根据我的笔记在新文档中起草一份发布公告"
  ],
  [
    "Reply to the open comments on my doc and resolve them",
    "回复我文档中待处理的批注并将其解决"
  ],
  [
    "Search, upload, download, and share files.",
    "搜索、上传、下载与共享文件。"
  ],
  [
    "Find last quarter's budget and share it with Alex",
    "找到上季度的预算并分享给 Alex"
  ],
  [
    "Move this week's design exports into the Launch folder",
    "将本周的设计导出文件移动到 Launch 文件夹"
  ],
  [
    "Download the Q3 report as a PDF",
    "将第三季度报告下载为 PDF"
  ],
  [
    "Find the trends and outliers in this sales sheet",
    "分析此销售表格中的趋势与异常值"
  ],
  [
    "Build a monthly budget tracker with formulas and a chart",
    "利用公式和图表构建月度预算跟踪表"
  ],
  [
    "Import this CSV and turn it into a pivot table by region",
    "导入此 CSV 文件并按区域生成数据透视表"
  ],
  [
    "Read, write, and format your Google Sheets. Fill in formulas, sort and clean\\ncolumns, import CSVs, build charts and pivot tables, and export the result.",
    "读取、编写与格式化您的 Google 表格。填充公式、排序与清洗列、导入 CSV、生成图表与透视表，并导出会话结果。"
  ],
  [
    "Read, write, and format your Google Sheets. Fill in formulas, sort and clean\ncolumns, import CSVs, build charts and pivot tables, and export the result.",
    "读取、编写与格式化您的 Google 表格。填充公式、排序与清洗列、导入 CSV、生成图表与透视表，并导出会话结果。"
  ],
  [
    "Turn my project notes into a 10-slide pitch deck",
    "将我的项目笔记制作成 10 页的展示幻灯片"
  ],
  [
    "Add a summary slide and speaker notes to my review deck",
    "为我的评审演示文稿添加总结幻灯片和演讲者备注"
  ],
  [
    "Export the final deck as a PDF",
    "将最终的演示文稿导出为 PDF"
  ],
  [
    "Create a new Android project called MyFirstApp using the empty-activity template",
    "使用 empty-activity 模板创建一个名为 MyFirstApp 的新 Android 项目"
  ],
  [
    "Run my app on a Samsung Galaxy Ultra device.",
    "在三星 Galaxy Ultra 设备上运行我的应用。"
  ],
  [
    "Test my app and make sure that it's ready to publish to Google Play.",
    "测试我的应用，确保已准备好发布到 Google Play。"
  ],
  [
    "Android Developer Tools Team",
    "Android 开发者工具团队"
  ],
  [
    "This plugin provides a specialized suite of skills for data engineers and database practitioners working on Google Cloud. It acts as an expert assistant, allowing you to use natural language prompts in your preferred coding agent to architect complex data pipelines, transform data with dbt, write Spark and BigQuery SQL notebooks, and orchestrate end-to-end workflows across GCP's data ecosystem.",
    "此插件为在 Google Cloud 上工作的数据工程师和数据库开发人员提供了一套专业的技能合集。它充当专家助手，允许您在偏好的编程智能体中使用自然语言提示来构建复杂的数据管道、使用 dbt 进行数据转换、编写 Spark 和 BigQuery SQL Notebook，并编排跨越 GCP 数据生态系统的端到端工作流。"
  ],
  [
    "Create a PySpark notebook to train a distributed Random Forest model on the BigQuery table my_transactions",
    "创建一个 PySpark 笔记本，在 BigQuery 的 my_transactions 表上训练分布式随机森林模型"
  ],
  [
    "Find datasets about customer orders in Knowledge Catalog and show their lineage",
    "在知识目录中查找有关客户订单的数据集并展示其数据血缘"
  ],
  [
    "My last Dataflow job failed. Find the root cause in the logs and propose a fix",
    "我的上一个 Dataflow 作业失败了。在日志中查找根本原因并提出修复建议"
  ],
  [
    "Prototype, build & run modern apps that users love with Firebase's backend, AI, and operational infrastructure.",
    "利用 Firebase 的后端、AI 和运维基础设施，原型设计、构建并运行深受用户喜爱的现代应用程序。"
  ],
  [
    "Set up Firebase in my app and connect it to a Firebase project",
    "在我的应用中设置 Firebase 并将其连接到 Firebase 项目"
  ],
  [
    "Add Firebase Authentication with Google sign-in to my app",
    "为我的应用添加带有 Google 登录的 Firebase 身份验证"
  ],
  [
    "Write and audit Firestore security rules for my data model",
    "为我的数据模型编写并审计 Firestore 安全规则"
  ],
  [
    "Add a Gemini-powered feature to my app with Firebase AI Logic",
    "使用 Firebase AI 逻辑为我的应用添加 Gemini 驱动的功能"
  ],
  [
    "Deploy my web app with Firebase App Hosting",
    "使用 Firebase App Hosting 托管部署我的 Web 应用"
  ],
  [
    "Look up the exact gcloud CLI command and IAM roles needed to deploy a Cloud Run service with Secret Manager",
    "查询使用 Secret Manager 部署 Cloud Run 服务所需的确切 gcloud CLI 命令和 IAM 角色"
  ],
  [
    "Search official Google documentation for how to implement structured outputs with the Gemini API",
    "在 Google 官方文档中搜索如何使用 Gemini API 实现结构化输出"
  ],
  [
    "Compare Cloud Run, GKE Autopilot, and App Engine based on official Google Cloud architecture guides",
    "根据官方 Google Cloud 架构指南对比 Cloud Run、GKE Autopilot 和 App Engine"
  ],
  [
    "Google Cloud guidance for coding agents: first-project onboarding, authentication and credential selection, and safety-critical validation for gcloud CLI commands. Includes the Google Developer Knowledge MCP server for grounded, up-to-date Google Cloud documentation.",
    "针对编程智能体的 Google Cloud 指南：首个项目上手引导、身份验证与凭据选择，以及针对 gcloud CLI 命令的安全关键验证。内置用于获取可靠、最新官方文档的 Google 开发者知识库 MCP 服务器。"
  ],
  [
    "Help me set up a new Google Cloud project, link billing, and configure local authentication.",
    "帮助我创建一个新的 Google Cloud 项目、关联结算账号并配置本地身份验证。"
  ],
  [
    "Configure Application Default Credentials (ADC) and IAM permissions for my local development environment.",
    "为我的本地开发环境配置应用默认凭据 (ADC) 和 IAM 权限。"
  ],
  [
    "Search official Google Cloud documentation using Developer Knowledge and validate my gcloud CLI commands.",
    "使用开发者知识库搜索官方 Google Cloud 文档并验证我的 gcloud CLI 命令。"
  ],
  [
    "Google Maps Platform",
    "Google 地图平台"
  ],
  [
    "Integration skill and tools for Google Maps Platform APIs",
    "用于 Google Maps Platform API 的集成技能与工具"
  ],
  [
    "Curated collection of agent skills for science tasks.",
    "面向科学任务精选的智能体技能合集。"
  ],
  [
    "Build a stateful multi-turn chat script using the Interactions API and the latest models",
    "使用 Interactions API 和最新模型构建有状态的多轮对话脚本"
  ],
  [
    "Create a real-time voice agent using the Gemini Live API and non-blocking function calling",
    "使用 Gemini Live API 和非阻塞函数调用创建实时语音智能体"
  ],
  [
    "Migrate my project from client.models.generate_content to the Interactions API",
    "将我的工程从 client.models.generate_content 迁移到 Interactions API"
  ],
  [
    "Audit this project for modern web best practices and modernization opportunities",
    "审查此工程以获取现代 Web 最佳实践和现代化升级建议"
  ],
  [
    "What is the recommended modern way to implement responsive dialogs and popovers?",
    "实现响应式对话框和弹出层（Popover）的现代推荐方案是什么？"
  ],
  [
    "Build a Chrome Extension with a side panel using Manifest V3 best practices",
    "遵循 Manifest V3 最佳实践构建带有侧边栏的 Chrome 浏览器扩展"
  ],
  [
    "Official plugin for Dart and Flutter that installs Flutter/Dart Skills, Rules, Custom Agents, and Dart MCP server for building natively compiled, visually stunning applications for mobile, web, desktop, and embedded devices from a single codebase",
    "Dart 与 Flutter 官方插件，安装 Flutter/Dart 技能、规则、自定义智能体与 Dart MCP 服务器，用于从单一代码库构建原生编译、视觉惊艳的移动端、Web 端、桌面端与嵌入式应用程序"
  ],
  [
    "Build a responsive Flutter layout that adapts across mobile, tablet, and desktop form factors",
    "构建自适应移动端、平板电脑和桌面端多种外形规格的响应式 Flutter 布局"
  ],
  [
    "Write a widget test using WidgetTester to verify UI rendering and user interactions",
    "使用 WidgetTester 编写 Widget 单元测试，验证 UI 渲染和用户交互"
  ],
  [
    "Audit my app for accessibility",
    "审查我的应用的无障碍可访问性支持"
  ],
  [
    "Diagnose and fix layout overflows or constraint issues in this Flutter widget",
    "诊断并修复此 Flutter 组件中的布局溢出或约束问题"
  ],
  [
    "Flutter Team",
    "Flutter 官方团队"
  ],
  [
    "Chrome DevTools Team",
    "Chrome DevTools 官方团队"
  ],
  [
    "Hide breakdown",
    "隐藏明细"
  ],
  [
    "Hide breakdowns",
    "隐藏明细"
  ],
  [
    "Dart and Flutter",
    "Dart 与 Flutter"
  ],
  [
    "Search and retrieve official documentation across Google Cloud, Gemini, Android, Firebase, Flutter, and Web. Requires Google Cloud credentials (ADC) or an API key.",
    "在 Google Cloud、Gemini、Android、Firebase、Flutter 与 Web 之间搜索并检索官方文档。需要 Google Cloud 凭据 (ADC) 或 API 密钥。"
  ],
  [
    "work with Google developer products. You can always change your choices in Settings.",
    "使用 Google 开发者产品。您可以随时在“设置”中更改您的选择。"
  ],
  [
    "Welcome to Antigravity",
    "欢迎使用 Antigravity"
  ],
  [
    "Welcome to",
    "欢迎使用"
  ],
  [
    "Continue with Google",
    "通过 Google 账号继续"
  ],
  [
    "Use Business Account",
    "使用企业账号"
  ],
  [
    "Having trouble signing in?",
    "登录遇到问题？"
  ],
  [
    "Gemini Models",
    "Gemini 模型"
  ],
  [
    "Weekly Limit 剩余",
    "每周限额剩余"
  ],
  [
    "Weekly Limit",
    "每周限额"
  ],
  [
    "Five Hour Limit 剩余",
    "5 小时限额剩余"
  ],
  [
    "Five Hour Limit",
    "5 小时限额"
  ],
  [
    "Show Less",
    "收起"
  ],
  [
    "Show More",
    "展开更多"
  ],
  [
    "Agent settings and permissions for conversations outside of projects.",
    "项目外对话的智能体设置与权限。"
  ],
  [
    "to ask for content changes for legal reasons.",
    "因法律原因申请更改内容。"
  ],
  [
    "just now",
    "刚刚"
  ],
  [
    "Global Permissions",
    "全局权限"
  ],
  [
    "Plan Review Policy",
    "计划审查策略"
  ],
  [
    "Type / and select plan to have the agent generate a plan.",
    "输入 / 并选择 plan 以让智能体生成计划。"
  ],
  [
    "Type / and select plan to have the agent generate a plan",
    "输入 / 并选择 plan 以让智能体生成计划"
  ],
  [
    "to have the agent generate a plan.",
    "以让智能体生成计划。"
  ],
  [
    "to have the agent generate a plan",
    "以让智能体生成计划"
  ],
  [
    "and select",
    "并选择"
  ],
  [
    "Provides a comprehensive guide, quick reference, and sitemap for Google Antigravity (AGY), including the Antigravity CLI (agy), Antigravity 2.0, Antigravity IDE, Python SDK, slash commands, keybindings, and customizations (skills, rules, MCP, sidecars). Activate this skill when the user asks questions about how to use, configure, or customize Antigravity, AGY, the agy CLI, the Antigravity IDE, or Antigravity 2.0.",
    "提供 Google Antigravity (AGY) 的综合指南、速查参考和站点地图，包括 Antigravity CLI (agy)、Antigravity 2.0、Antigravity IDE、Python SDK、斜杠命令、快捷键和自定义项（技能、规则、MCP、Sidecar）。当用户询问如何使用、配置或自定义 Antigravity 时激活此技能。"
  ],
  [
    "Within each group, models share a weekly limit and a 5-hour limit. Quota is consumed proportionally to the cost of the tokens. Thus, limits will last longer with shorter tasks or using more cost-effective models. The 5-hour limit smooths out aggregate demand to fairly distribute global capacity across all users, while your weekly limit is tied directly to your individual tier.",
    "在每个分组中，模型共享每周限额和 5 小时限额。额度的消耗与 Token 的成本成比例。因此，使用较短的任务或更具性价比的模型可以让限额维持更久。5 小时限额平滑了总体需求，以便在所有用户之间公平地分配全局容量，而您的每周限额则直接与您的个人套餐等级挂钩。"
  ],
  [
    "When enabled, Agent can use browser tools to open URLs, read web pages, and interact with browser content. This allows the Agent access to important (and often critical) knowledge and methods of validation, but any browser integration does increase exposure to external malicious parties for security exploits.",
    "启用后，智能体可以使用浏览器工具打开 URL、读取网页并与浏览器内容交互。这能让智能体获取重要知识和验证方式，但任何浏览器集成都可能增加遭受外部恶意利用的风险。"
  ],
  [
    "Rules and formatting guidelines for writing Dart /// API documentation and doc comments. Use when documenting Dart code, writing doc comments for any Dart declaration (libraries, classes, methods, variables, etc.), or when instructed to follow the Effective Dart documentation guidelines.",
    "编写 Dart /// API 文档和注释的规则与格式准则。在编写 Dart 文档注释或遵循 Effective Dart 指南时使用。"
  ],
  [
    "Agent auto-executes commands matched by an allow list entry. For Unix shells, an allow list entry matches a command if its space-separated tokens form a prefix of the command\\'s tokens. For PowerShell, the entry tokens may match any contiguous subsequence of the command tokens.",
    "智能体将自动执行与允许列表条目匹配的命令。对于 Unix Shell，如果允许列表条目的空格分隔令牌是该命令令牌的前缀，则匹配。对于 PowerShell，条目令牌可匹配命令令牌的任意连续子序列。"
  ],
  [
    "How to render rich interactive HTML widgets inline in the chat or as standalone artifacts. Use this skill when you want to show the user diagrams, data visualizations, interactive controls, educational walkthroughs, or any rich visual content beyond plain text and markdown.",
    "在聊天内联或作为独立产物渲染丰富的交互式 HTML 微件。当您想要向用户展示图表、数据可视化、交互式控件、教程或超越纯文本和 Markdown 的任何丰富视觉内容时使用此技能。"
  ],
  [
    "Guide agents to use `package:ffigen` to automatically generate FFI bindings instead of writing them manually. Use this skill when a task involves writing new FFI bindings, extending C/Objective-C/Swift integrations, or replacing hand-crafted `dart:ffi` setups.",
    "指导智能体使用 `package:ffigen` 自动生成 FFI 绑定代码，而非手动编写。当任务涉及编写新 FFI 绑定、扩展 C/Objective-C/Swift 集成或替换手写 `dart:ffi` 时使用此技能。"
  ],
  [
    "Configures Flutter Driver for app interaction and converts MCP actions into permanent integration tests. Use when adding integration testing to a project, exploring UI components via MCP, or automating user flows with the integration_test package.",
    "配置 Flutter Driver 以便进行应用交互，并将 MCP 操作转换为持久集成测试。在添加集成测试或自动化用户流程时使用。"
  ],
  [
    "Comprehensive guide and reference for the Antigravity Customization System. Use to explain how customizations work, their loading priority, discovery mechanisms, and to guide the creation of skills, rules, plugins, hooks, and MCP servers.",
    "Antigravity 自定义系统的综合指南与参考。用于解释自定义项的工作原理、加载优先级、发现机制，并指导技能、规则、插件、钩子和 MCP 服务器的创建。"
  ],
  [
    "Implement a component-level test using `WidgetTester` to verify UI rendering and user interactions (tapping, scrolling, entering text). Use when validating that a specific widget displays correct data and responds to events as expected.",
    "使用 `WidgetTester` 实现组件级测试，验证 UI 渲染和用户交互（点击、滚动、输入文本）。在验证特定组件正常显示与响应事件时使用。"
  ],
  [
    "Fixes Flutter layout errors (overflows, unbounded constraints) using Dart and Flutter MCP tools. Use when addressing \"RenderFlex overflowed\", \"Vertical viewport was given unbounded height\", or similar layout issues.",
    "使用 Dart 和 Flutter MCP 工具修复布局溢出与无界约束错误（如 \"RenderFlex overflowed\" 等）。"
  ],
  [
    "Configure `MaterialApp.router` using a package like `go_router` for advanced URL-based navigation. Use when developing web applications or mobile apps that require specific deep linking and browser history support.",
    "使用类似 `go_router` 的库配置 `MaterialApp.router` 以实现高级 URL 声明式路由导航。"
  ],
  [
    "Add `flutter_localizations` and `intl` dependencies, enable \"generate true\" in `pubspec.yaml`, and create an `l10n.yaml` configuration file. Use when initializing localization support for a new Flutter project.",
    "添加 `flutter_localizations` 和 `intl` 依赖项，启用自动生成并创建 `l10n.yaml`。在为新 Flutter 项目初始化国际化与多语言支持时使用。"
  ],
  [
    "Execute `dart analyze` to identify warnings and errors, and use `dart fix --apply` to automatically resolve mechanical lint issues. Use during development to ensure code quality and before committing changes.",
    "执行 `dart analyze` 识别警告和错误，并使用 `dart fix --apply` 自动解决机械式语法规范问题。在开发过程中及提交更改前使用以确保代码质量。"
  ],
  [
    "The breakdown below shows token usage from customizations like rules, skills, and MCP. If a budget is exceeded, large rules are demoted to path pointers and large customizations are excluded automatically.",
    "以下明细显示了来自规则、技能和 MCP 等自定义项的 Token 使用量。如果超出预算，大型规则将降级为路径指针，大型自定义项将自动排除。"
  ],
  [
    "Use `LayoutBuilder`, `MediaQuery`, or `Expanded/Flexible` to create a layout that adapts to different screen sizes. Use when you need the UI to look good on both mobile and tablet/desktop form factors.",
    "使用 `LayoutBuilder`、`MediaQuery` 或 `Expanded/Flexible` 创建自适应不同屏幕尺寸的布局。在适配移动端、平板和桌面端时使用。"
  ],
  [
    "Automatically migrate legacy workflows to modern skills across global and workspace configurations. Scans for existing workflows, creates target SKILL.md files, and safely archives old workflow files.",
    "跨全局和工作区配置自动将旧版工作流迁移至现代技能。扫描现有工作流，创建目标 SKILL.md 文件并安全归档旧工作流文件。"
  ],
  [
    "Define and generate mock objects for external dependencies using `package:mockito` and `build_runner`. Use when unit testing classes that depend on complex external services like APIs or databases.",
    "使用 `package:mockito` 和 `build_runner` 为外部依赖项定义并生成 Mock 对象。在对依赖外部 API 或数据库等复杂服务的类进行单元测试时使用。"
  ],
  [
    "Adds interactive widget previews to the project using the previews.dart system. Use when creating new UI components or updating existing screens to ensure consistent design and interactive testing.",
    "使用 previews.dart 系统向项目添加交互式组件预览。在创建新 UI 组件或更新界面时使用。"
  ],
  [
    "When toggled on, Antigravity IDE will use your AI credits to fulfill model requests once you\\'re out of model quota. Antigravity IDE will always use your model quota first before using AI credits.",
    "开启后，当模型额度用完时，Antigravity IDE 将使用 AI 积分完成模型请求。Antigravity IDE 始终会先使用模型额度，再使用 AI 积分。"
  ],
  [
    "Build applications with the Gemini Interactions API and Live API, including text generation, multi turn chat, streaming, function calling, managed agents, and real-time audio/video streaming.",
    "使用 Gemini Interactions API 和 Live API 构建应用，支持文本生成、多轮对话、流式传输、函数调用、托管智能体及实时音视频流。"
  ],
  [
    "Build applications with the Gemini Interactions API and Live API, including text generation, multi-turn chat, streaming, function calling, managed agents, and real-time audio/video streaming.",
    "使用 Gemini Interactions API 和 Live API 构建应用，支持文本生成、多轮对话、流式传输、函数调用、托管智能体及实时音视频流。"
  ],
  [
    "Agent asks for permission before executing commands matched by a deny list entry. The deny list follows the same matching rules as the allow list and takes precedence over the allow list.",
    "在执行与拒绝列表条目匹配的命令前，智能体会先请求权限。拒绝列表遵循与允许列表相同的匹配规则，且优先级高于允许列表。"
  ],
  [
    "When toggled on, Antigravity will use your AI credits to fulfill model requests once you're out of model quota. Antigravity will always use your model quota first before using AI credits.",
    "开启后，当模型额度用完时，Antigravity 会使用 AI 积分完成模型请求。Antigravity 会始终先使用模型额度，再使用 AI 积分。"
  ],
  [
    "View your available model quota and AI credits. Model quota refreshes periodically based on your plan. Enable AI Credit Overages to continue using models when your quota is exhausted.",
    "查看可用的模型额度和 AI 积分。模型额度会根据你的计划定期刷新。启用 AI 积分超额使用后，可在额度耗尽时继续使用模型。"
  ],
  [
    "Write and organize unit tests for functions, methods, and classes using `package:test`. Use when creating new logic or fixing bugs to ensure code remains correct and regression-free.",
    "使用 `package:test` 为函数、方法和类编写并组织单元测试。在编写新逻辑或修复 Bug 时使用，以确保代码保持正确且无回归。"
  ],
  [
    "Build applications with the Gemini Interactions API and Live API, including text, image, video, and speech generation, managed agents, and real-time multimodal streaming.",
    "使用 Gemini Interactions API 和 Live API 构建应用，包括文本、图像、视频与语音生成、托管智能体及实时多模态流。"
  ],
  [
    "Build applications with the Gemini Interactions API and Live API, including text, image, video, and speech generation, managed agents, and real-time multimodal streaming",
    "使用 Gemini Interactions API 和 Live API 构建应用，包括文本、图像、视频与语音生成、托管智能体及实时多模态流"
  ],
  [
    "Build applications with the Gemini Interactions API and Live API, including text generation, multi turn chat, streaming, function calling, managed agents, and real ...",
    "使用 Gemini Interactions API 和 Live API 构建应用，支持文本生成、多轮对话、流式传输、函数调用、托管智能体及实时交互..."
  ],
  [
    "The breakdown below shows token usage from customizations like skills, rules, and MCP. If the budget is exceeded, large customizations will be truncated automatically.",
    "下面的明细展示技能、规则和 MCP 等自定义内容的 Token 使用量。如果超出预算，较大的自定义内容会被自动截断。"
  ],
  [
    "Build applications with the Gemini Interactions API and Live API, including text generation, multi-turn chat, streaming, function calling, managed agents, and real ...",
    "使用 Gemini Interactions API 和 Live API 构建应用，支持文本生成、多轮对话、流式传输、函数调用、托管智能体及实时..."
  ],
  [
    "Build applications with the Gemini Interactions API and Live API, including text generation, multi-turn chat, streaming, function calling, managed agents, and real-",
    "使用 Gemini Interactions API 和 Live API 构建应用，支持文本生成、多轮对话、流式传输、函数调用、托管智能体及实时..."
  ],
  [
    "Build and prototype location-aware applications with Google Maps Platform. Integrate interactive maps, search and inspect Places details, calculate optimal routes.",
    "使用 Google Maps Platform 构建并原型设计位置感知应用。集成交互式地图、搜索并检查地点详情、计算最佳路线。"
  ],
  [
    "Create model classes with `fromJson` and `toJson` methods using `dart:convert`. Use when manually mapping JSON keys to class properties for simple data structures.",
    "使用 `dart:convert` 创建包含 `fromJson` 和 `toJson` 方法的数据模型类。在手动将 JSON 键映射为类属性时使用。"
  ],
  [
    "Orchestrates Android development tasks including project creation, deployment, SDK management, and environment diagnostics using the `android` command-line tool.",
    "使用 android 命令行工具协调 Android 开发任务，包括项目创建、部署、SDK 管理和环境诊断。"
  ],
  [
    "Configure the browser subagent. It requires Google Chrome to be installed. The browser subagent can be invoked by typing /browser in the conversation input box.",
    "配置浏览器子智能体。它需要安装 Google Chrome。你可以在对话输入框中输入 /browser 来调用浏览器子智能体。"
  ],
  [
    "Architects a Flutter application using the recommended layered approach (UI, Logic, Data). Use when structuring a new project or refactoring for scalability.",
    "使用官方推荐的分层架构（UI、逻辑、数据）构建 Flutter 应用程序。在设计新项目结构或进行可扩展性重构时使用。"
  ],
  [
    "Build applications with the Gemini Interactions API and Live API, including text generation, multi turn chat, streaming, function calling, managed agents",
    "使用 Gemini Interactions API 和 Live API 构建应用，包括文本生成、多轮对话、流式传输、函数调用、托管智能体"
  ],
  [
    "Please describe the issue in detail. The more actionable your feedback, the quicker our team can address your request. Some helpful information includes:",
    "请详细描述问题。您的反馈越具体，我们的团队就能越快处理您的请求。一些有用的信息包括："
  ],
  [
    "Build applications with the Gemini Interactions API and Live API, including text generation, multi-turn chat, streaming, function calling, managed agents",
    "使用 Gemini Interactions API 和 Live API 构建应用，支持文本生成、多轮对话、流式传输、函数调用、托管智能体"
  ],
  [
    "When enabled, the agent will be able to access its knowledge base to inform its responses and automatically generate knowledge items in the background.",
    "启用后，智能体将能够访问其知识库以辅助生成回复，并在后台自动生成知识项。"
  ],
  [
    "Expert at reviewing Flutter code for accessibility (a11y) issues. Invoke this agent to perform an a11y review of a codebase, pending changes, or PR.",
    "擅长审查 Flutter 代码的无障碍 (a11y) 规范与兼容性问题。调用此智能体可对代码库、待提交更改或 PR 进行专业的无障碍审查。"
  ],
  [
    "Automatically prompt you to restart the app when a new update is available. When disabled, you can check for updates manually from the app menu.",
    "当有新版本可用时自动提示您重启应用。禁用后，您可以从应用菜单手动检查更新。"
  ],
  [
    "Guidelines for interacting with GitHub and request permissions from the user when commands fail due to restrictions in the agent environment.",
    "与 GitHub 交互的准则，并在命令因智能体环境限制而失败时向用户请求权限。"
  ],
  [
    "Uses get_runtime_errors and lsp to fetch an active stack trace, locate the failing line, apply a fix, and verify resolution via hot_reload.",
    "使用 get_runtime_errors 和 LSP 获取活动堆栈跟踪、定位故障代码行、应用修复，并通过热重载验证问题解决。"
  ],
  [
    "Note: A change to this setting will only apply to new messages sent to Agent. In-progress responses will use the previous setting value.",
    "注意：对此设置的更改将仅适用于发送给智能体的新消息。正在进行的回复将使用之前的设置值。"
  ],
  [
    "Changes the base URL for marketplace search results. You must restart Antigravity to use the new marketplace after changing this value.",
    "更改插件市场搜索结果的基准 URL。更改此值后，您必须重启 Antigravity 才能使用新的插件市场。"
  ],
  [
    "Use the `http` package to execute GET, POST, PUT, or DELETE requests. Use when you need to fetch from or send data to a REST API.",
    "使用 `http` 包执行 GET、POST、PUT 或 DELETE 网络请求。当需要调用 REST API 发送或拉取数据时使用。"
  ],
  [
    "It requires Google Chrome to be installed. The browser subagent can be invoked by typing /browser in the conversation input box.",
    "它需要安装 Google Chrome 才能运行。您可以在对话输入框中输入 /browser 来调用浏览器子智能体。"
  ],
  [
    "Changes the base URL on each extension page. You must restart Antigravity to use the new marketplace after changing this value.",
    "更改每个插件页面的基准 URL。更改此值后，您必须重启 Antigravity 才能使用新的插件市场。"
  ],
  [
    "Entrypoint structure, exit codes, cross-platform scripts. Use when building command line utilities, scripts, or applications.",
    "入口点结构、退出状态码、跨平台脚本。在构建命令行实用工具、脚本或应用程序时使用。"
  ],
  [
    "When enabled, Agent is given awareness of lint errors created by its edits and may fix them without explicit user prompting.",
    "启用后，智能体将感知到其编辑所导致的 Lint 错误，并可在不明确提示用户的情况下进行修复。"
  ],
  [
    "Proactively connect to running Dart/Flutter apps and trigger hot reload or hot restart upon editing .dart files under lib/.",
    "主动连接到运行中的 Dart/Flutter 应用，在编辑 lib/ 目录下的 .dart 文件时自动触发热重载 (Hot Reload) 或热重启 (Hot Restart)。"
  ],
  [
    "Choose a predefined security preset for the agent. This controls terminal auto-execution policy, and file access policy.",
    "为智能体选择预设的安全策略。这控制终端自动执行策略和文件访问策略。"
  ],
  [
    "This sidecar runs from a path that is not officially supported. Make sure your code is in a trusted location in google3.",
    "此 Sidecar 从非官方支持的路径运行。请确保您的代码位于 google3 中的受信任位置。"
  ],
  [
    "Grant the selected actions on the listed pull request numbers \\u2014 a comma-separated list like 1, 2, 3, or * for all.",
    "授予对列出的拉取请求 (PR) 编号执行所选操作的权限 — 逗号分隔列表（如 1, 2, 3 或 * 表示全部）。"
  ],
  [
    "Saves to your global ~/.gemini/antigravity/agents/ directory. This script will be available across all your workspaces.",
    "保存至全局 ~/.gemini/antigravity/agents/ 目录。此脚本将在您的所有工作区中可用。"
  ],
  [
    "Custom path for the browser user profile directory. Leave empty for default (~/.gemini/antigravity-browser-profile).",
    "浏览器用户资料目录的自定义路径。留空则使用默认路径（~/.gemini/antigravity-browser-profile）。"
  ],
  [
    "We opened a popup for you to authorize adding the bot to your chat. Please copy the code from it and paste it below:",
    "我们已弹出授权窗口以便您将机器人添加到聊天中。请复制其中的验证码并粘贴在下方："
  ],
  [
    "Grant the selected actions on the listed pull request numbers — a comma-separated list like 1, 2, 3, or * for all.",
    "授予对列出的拉取请求 (PR) 编号执行所选操作的权限 — 逗号分隔列表（如 1, 2, 3 或 * 表示全部）。"
  ],
  [
    "When enabled, \\'Explain and Fix\\' actions will continue in the current conversation instead of starting a new one.",
    "启用后，“解释并修复”操作将在当前对话中继续，而不是开始新对话。"
  ],
  [
    "Workflow for fixing package version conflicts. Use this when `pub get` fails due to incompatible package versions.",
    "修复依赖包版本冲突的工作流程。当 `pub get` 因包版本不兼容而失败时使用。"
  ],
  [
    "The app will be accessible from the menu bar and will keep running in the background when all windows are closed.",
    "应用可从菜单栏访问，并会在所有窗口关闭后继续在后台运行。"
  ],
  [
    "A nickname for identifying this application in the companion website. Changing this will restart the connection.",
    "用于在配套网站中标识此应用程序的昵称。修改此项将重新建立连接。"
  ],
  [
    "Continue your conversation on your phone, tablet, or another device by scanning the QR code or copying the link.",
    "通过扫描二维码或复制链接，在手机、平板或其他设备上继续您的对话。"
  ],
  [
    "Grant the selected actions on the listed issue numbers \\u2014 a comma-separated list like 1, 2, 3, or * for all.",
    "授予对列出的 Issue 编号执行所选操作的权限 — 逗号分隔列表（如 1, 2, 3 或 * 表示全部）。"
  ],
  [
    "When enabled, 'Explain and Fix' actions will continue in the current conversation instead of starting a new one.",
    "启用后，“解释并修复”操作将在当前对话中继续进行，而不是开启新对话。"
  ],
  [
    "Reliable automation, in-depth debugging, and performance analysis in Chrome using Chrome DevTools and Puppeteer",
    "使用 Chrome DevTools 和 Puppeteer 在 Chrome 浏览器中执行高可靠自动化、深度调试与性能分析。"
  ],
  [
    "We recommend attaching logs. Attaching logs will help the Antigravity team act on and prioritize your feedback.",
    "我们建议附上日志。附上日志将有助于 Antigravity 团队处理并优先解决您的反馈。"
  ],
  [
    "When enabled, the Changes Overview toolbar will automatically expand when Agent finishes generating a response.",
    "启用后，Changes Overview 工具栏将在智能体完成回复生成时自动展开。"
  ],
  [
    "A shell setup script run before every command the agent executes in this project. Overrides the global script.",
    "在智能体于此项目中执行每条命令前运行的 Shell 初始化脚本。将覆盖全局脚本。"
  ],
  [
    "Projects serve as your workspace where your agents work. Each project has its own file scope and permissions.",
    "项目是智能体工作的工作区。每个项目都有自己的文件范围和权限。"
  ],
  [
    "Autonomous mode active: the agent works independently, and does not ask questions or request new permissions.",
    "自主模式已激活：智能体将独立工作，不提出问题或申请新权限。"
  ],
  [
    "This step is visible in the standard conversation view, but was excluded from the messages sent to the model.",
    "此步骤在标准对话视图中可见，但已从发送给模型的消息中排除。"
  ],
  [
    "Agents run in a secure sandbox that restricts access to external resources outside of your trusted folders.",
    "智能体在安全沙盒中运行，限制访问受信任文件夹之外的外部资源。"
  ],
  [
    "Give the agent awareness of lint errors created by its edits so it can fix them without explicit prompting.",
    "使智能体能感知其代码编辑引入的代码检查 (Lint) 错误，以便在无需明确提示的情况下自动修复。"
  ],
  [
    "Grant the selected actions on the listed issue numbers — a comma-separated list like 1, 2, 3, or * for all.",
    "授予对列出的 Issue 编号执行所选操作的权限 — 逗号分隔列表（如 1, 2, 3 或 * 表示全部）。"
  ],
  [
    "Prototype, build & run modern apps users love with Firebase\\'s backend, AI, and operational infrastructure.",
    "利用 Firebase 的后端、AI 和运营基础设施，原型设计、构建和运行深受用户喜爱的现代应用。"
  ],
  [
    "Prototype, build & run modern apps users love with Firebase's backend, AI, and operational infrastructure.",
    "利用 Firebase 的后端、AI 和运营基础设施，原型设计、构建并运行用户喜爱的现代化应用。"
  ],
  [
    "Terminal commands always require review and the agent cannot access files outside of its given workspaces.",
    "终端命令始终需要审核，且智能体无法访问指定工作区之外的文件。"
  ],
  [
    "Non-model response token counts are estimations. The model API does not return per-message token counts.",
    "非模型响应的 Token 计数为估算值。模型 API 不返回单条消息的 Token 计数。"
  ],
  [
    "Select the workspace type that will be used for new conversations started with the New Workspace option.",
    "选择通过“新建工作区”选项开启新对话时所采用的工作区类型。"
  ],
  [
    "The agent works with autonomy-enhancing features, and does not ask questions or request new permissions.",
    "智能体使用增强自主功能工作，不会提出问题或申请新权限。"
  ],
  [
    "Time spent waiting in queue for previous tools to complete or move to background before execution began.",
    "在执行开始前，排队等待前置工具完成或移至后台所花费的时间。"
  ],
  [
    "Skills added here will be added to your skills.json and available to all agents on your CitC workspace.",
    "在此添加的技能将写入 skills.json，并对 CitC 工作区中的所有智能体生效。"
  ],
  [
    "This Google Cloud project is not supported. Input a different project, or sign in with another account.",
    "不支持此 Google Cloud 项目。请输入其他项目，或使用其他账号登录。"
  ],
  [
    "to be installed. The browser subagent can be invoked by typing /browser in the conversation input box.",
    "才能安装运行。您可以在对话输入框中输入 /browser 来调用浏览器子智能体。"
  ],
  [
    "When enabled, Agent will use IDE\\'s shell integration to detect and report terminal command execution.",
    "启用后，智能体将使用 IDE 的 Shell 集成来检测并报告终端命令的执行。"
  ],
  [
    "When enabled, Agent will use IDE's shell integration to detect and report terminal command execution.",
    "启用后，智能体将使用 IDE 的 Shell 集成检测并报告终端命令的执行情况。"
  ],
  [
    "When toggled on, Antigravity IDE collects usage data to help Google enhance performance and features.",
    "开启后，Antigravity IDE 将收集使用数据，以帮助 Google 提升性能和功能。"
  ],
  [
    "Continue your work from another device with Remote Control. Scan the QR code or open the link below.",
    "通过“远程控制”在其他设备上继续您的工作。请扫描二维码或打开下方链接。"
  ],
  [
    "Keep the app accessible from the menu bar and running in the background when all windows are closed.",
    "应用可从菜单栏访问，并在所有窗口关闭后继续在后台运行。"
  ],
  [
    "Curated collection of agent skills for science that help with data analysis, modeling, and research.",
    "面向科学领域的精选智能体技能合集，助力数据分析、建模与科研。"
  ],
  [
    "Bundles of customizations that can include skills, agents, rules, MCP servers, hooks, and sidecars.",
    "自定义功能合集，可包含技能、智能体、规则、MCP 服务器、钩子和 Sidecar。"
  ],
  [
    "Modify scoped permissions, folders, and agent settings like Sandbox and Terminal Command Execution.",
    "修改作用域权限、文件夹，以及沙盒和终端命令执行等智能体设置。"
  ],
  [
    "Workflows are being deprecated in favor of skills. You can use the agent to migrate your workflows.",
    "工作流正在弃用并逐步由技能取代。您可以让智能体帮您迁移工作流。"
  ],
  [
    "Requires manual review for all terminal commands and file accesses outside of the working folders.",
    "对所有工作文件夹之外的终端命令和文件访问都需要手动审核。"
  ],
  [
    "Requires manual review for all terminal commands and file accesses outside of the working folders",
    "对所有工作文件夹之外的终端命令和文件访问都需要手动审核"
  ],
  [
    "When toggled on, Antigravity collects usage data to help Google enhance performance and features.",
    "开启后，Antigravity 会收集使用数据，帮助 Google 改进性能和功能。"
  ],
  [
    "Your agent\\u2019s ability to execute commands is also controlled by enterprise security policies.",
    "您的智能体执行命令的能力亦受企业安全策略控制。"
  ],
  [
    "Automatically expand the Changes Overview toolbar when the agent finishes generating a response.",
    "智能体完成回复生成后，自动展开更改概览工具栏。"
  ],
  [
    "Install this plugin to see the commands it adds, along with its skills, agents and MCP servers.",
    "安装此插件以查看其添加的命令，以及技能、智能体和 MCP 服务器。"
  ],
  [
    "When debug mode is on, you can see additional information about each steps in the conversation.",
    "开启调试模式时，您可以查看对话中每个步骤的详细信息。"
  ],
  [
    "Grant read access to workflow runs and allow dispatching workflows on specific files and refs.",
    "授予对工作流运行记录的读取权限，并允许针对指定文件和引用调度工作流。"
  ],
  [
    "These settings can only be changed on the computer running the app, not from a remote session.",
    "这些设置只能在运行本应用的计算机上修改，无法在远程会话中更改。"
  ],
  [
    "Customizations are automatically discovered and loaded from the following customization roots:",
    "自定义配置将从以下根目录自动发现并加载生效："
  ],
  [
    "All terminal commands require review. The agent can read or write to any file in the machine.",
    "所有终端命令均需要审核。智能体可以读写计算机上的任何文件。"
  ],
  [
    "Opens in the in-app preview pane. Some sites don't support iframe embedding and may not load.",
    "在应用内预览窗格中打开。部分网站不支持 iframe 嵌入，可能无法加载。"
  ],
  [
    "Skills providing tailored instructions for happy path Dart and Flutter development workflows.",
    "为顺畅的 Dart 与 Flutter 开发工作流提供定制化操作指引。"
  ],
  [
    "All terminal commands require review. The agent can read or write to any file in the machine",
    "所有终端命令均需要审核。智能体可以读写计算机上的任何文件"
  ],
  [
    "Confirm the command is safe to run outside of the sandbox with full network and disk access.",
    "确认该命令可在沙盒外 safe 运行，并拥有完整网络和磁盘访问权限。"
  ],
  [
    "Your agent’s ability to execute commands is also controlled by enterprise security policies.",
    "您的智能体执行命令的能力亦受企业安全策略控制。"
  ],
  [
    "Accessed via the gear icon in the top right or the sidebar, Settings allows you to control:",
    "通过右上角齿轮图标或侧边栏访问，设置中心允许您配置以下各项："
  ],
  [
    "Build on Google's developer platforms, including Android, Chrome, Gemini, and Google Cloud.",
    "在 Google 开发者平台上构建应用，包括 Android、Chrome、Gemini 与 Google Cloud。"
  ],
  [
    "Port number for Chrome DevTools Protocol remote debugging. Leave empty for default (9222).",
    "Chrome DevTools Protocol 远程调试端口号。留空则使用默认值（9222）。"
  ],
  [
    "Try out early-stage features before they ship. These may change or be removed at any time.",
    "在功能正式发布前抢先体验实验性功能。这些功能可能会随时变更或移除。"
  ],
  [
    "When enabled, the agent will be able to access past conversations to inform its responses.",
    "启用后，智能体将能够访问历史对话以辅助其生成回复。"
  ],
  [
    "Build on Google's developer platforms, including Android, Chrome, Gemini, and Google Cloud",
    "在 Google 开发者平台上构建应用，包括 Android、Chrome、Gemini 与 Google Cloud"
  ],
  [
    "技能 providing tailored instructions for happy path Dart and Flutter development workflows.",
    "为顺畅的 Dart 与 Flutter 开发工作流提供定制化操作指引。"
  ],
  [
    "Controls whether the agent can run custom JavaScript to automate complex browser actions.",
    "控制智能体是否可以运行自定义 JavaScript 来自动化复杂浏览器操作。"
  ],
  [
    "Specialized suite of skills for data engineers and database practitioners on Google Cloud",
    "面向 Google Cloud 上的数据工程师和数据库从业人员的专业技能套件。"
  ],
  [
    "Use this option if your administrator has provided you with advanced login configurations",
    "如果您的管理员为您提供了高级登录配置，请使用此选项"
  ],
  [
    "A label for this computer when you connect from another device. Changing it reconnects.",
    "从其他设备连接此电脑时显示的标识名称。修改后将重新连接。"
  ],
  [
    "The breakdown below shows token usage from customizations like rules, skills, and MCP.",
    "以下明细显示了来自规则、技能和 MCP 等自定义项的 Token 使用量。"
  ],
  [
    "Agent can retrieve console logs from the browser and return it for further processing.",
    "智能体可以从浏览器中提取控制台日志并返回进行进一步分析。"
  ],
  [
    "Please verify your account, then sign in again to continue. Learn more by visiting our",
    "请验证您的账号，然后重新登录以继续。了解更多信息，请访问"
  ],
  [
    "providing tailored instructions for happy path Dart and Flutter development workflows.",
    "为顺畅的 Dart 与 Flutter 开发工作流提供定制化操作指引。"
  ],
  [
    "When enabled, Antigravity will play a sound when Agent finishes generating a response.",
    "启用后，Antigravity 会在智能体完成回复生成时播放提示音。"
  ],
  [
    "When enabled, the agent will include default customizations, including default skills.",
    "启用后，智能体将包含默认自定义设置（包括内置默认技能）。"
  ],
  [
    "Terminal Auto-Execution: Toggle whether the agent can run safe commands automatically.",
    "终端自动执行：控制智能体是否可以自动运行白名单中的安全命令。"
  ],
  [
    "Curated collection of agent skills for science, creative projects, analysis, and more.",
    "面向科学、创意项目、分析等领域的精选智能体技能合集。"
  ],
  [
    "The browser subagent can be invoked by typing /browser in the conversation input box.",
    "在对话输入框中输入 /browser 即可调用浏览器子智能体。"
  ],
  [
    "For a full list of available locations and deployment endpoints, please refer to the",
    "有关可用位置与部署端点的完整列表，请参阅"
  ],
  [
    "Receive product updates, tips, and promotions from Google Antigravity IDE via email.",
    "通过电子邮件接收来自 Google Antigravity IDE 的产品更新、技巧和促销活动。"
  ],
  [
    "The following background tasks were running at the time this checkpoint was created.",
    "创建此检查点时，以下后台任务正在运行。"
  ],
  [
    "Predict the location of your next edit and navigates you there with a tab keypress.",
    "预测您下一次编辑的位置，并在按下 Tab 键时导航至该处。"
  ],
  [
    "Predict the location of your next edit and navigate you there with a tab keypress.",
    "预测下一次编辑的位置，并通过按下 Tab 键直接跳转至该处。"
  ],
  [
    "To modify notification settings, open your operating system's system preferences.",
    "要修改通知设置，请打开操作系统的系统设置。"
  ],
  [
    "Browser: Opens an integrated view for web-based tasks or direct URL interactions.",
    "浏览器：打开用于执行网页任务或直接进行 URL 交互的集成视图。"
  ],
  [
    "Connect to Google Workspace, including Docs, Sheets, Slides, Drive, and Calendar.",
    "连接至 Google 工作区，包括文档、表格、幻灯片、云端硬盘与日历。"
  ],
  [
    "Are you sure you want to delete this conversation? This action cannot be undone.",
    "您确定要删除此对话吗？此操作无法撤消。"
  ],
  [
    "Receive product updates, tips, and promotions from Google Antigravity via email.",
    "通过电子邮件接收 Google Antigravity 的产品更新、技巧和促销信息。"
  ],
  [
    "Connect to Google Workspace, including Docs, Sheets, Slides, Drive, and Calendar",
    "连接至 Google 工作区，包括文档、表格、幻灯片、云端硬盘与日历"
  ],
  [
    "Pin a contrib experiment variant (force_contrib_variant). Requires Core Direct.",
    "固定贡献实验变体 (force_contrib_variant)。需要 Core Direct 支持。"
  ],
  [
    "Reflect on recent successes or corrections to capture reusable skills or rules.",
    "复盘近期的成功经验或纠错，沉淀可复用的技能或规则。"
  ],
  [
    "Configures how the agent tries to access files outside of its working folders.",
    "配置智能体尝试访问其工作区目录之外文件时的行为策略。"
  ],
  [
    "No model specified for Battle Mode, falling back to use current selected model",
    "未指定对战模式模型，回退至当前选定模型"
  ],
  [
    "A disabled plugin still appears in the plugin list so you can turn it back on,",
    "已禁用的插件仍会显示在列表中，以便您随时重新开启，"
  ],
  [
    "You can change the setting from the plugin section of the settings UI, or from",
    "您可以在设置界面的“插件”板块中修改此配置，或通过"
  ],
  [
    "You can upgrade to a Google AI Ultra plan to receive the highest rate limits.",
    "你可以升级到 Google AI Ultra 套餐以获得最高速率限制。"
  ],
  [
    "Settings: Global configuration for agent behavior, security, and tool access.",
    "设置：配置智能体行为、安全策略和工具访问权限的全局中心。"
  ],
  [
    "A Gemini-powered security agent decides if commands should be auto-approved.",
    "由内置安全审查智能体智能判定命令是否可自动批准。"
  ],
  [
    "Show browser notifications when your action is needed or execution finishes.",
    "当需要您操作或执行完成时显示系统通知。"
  ],
  [
    "These MCP allowlist rules are enforced by your organization's administrator.",
    "这些 MCP 白名单规则由您组织的主管管理员强制执行。"
  ],
  [
    "Comprehensive guide and reference for the Antigravity Customization System.",
    "Antigravity 自定义系统的综合指南与参考。"
  ],
  [
    "I prefer an immediate single response to prioritize productivity right now.",
    "我倾向于立即获取单次回复以提高当前效率。"
  ],
  [
    "Use Add MCP to browse the store, or add a custom server via the MCP config.",
    "使用“添加 MCP”浏览插件商店，或通过 MCP 配置文件添加自定义服务器。"
  ],
  [
    "You currently don't have any MCP Servers installed. Add an MCP server above",
    "你当前还没有安装任何 MCP 服务器。请在上方添加 MCP 服务器。"
  ],
  [
    "Hook will only trigger if the tool name matches run_command or view_file.",
    "只有当工具名称匹配 run_command 或 view_file 时才会触发钩子。"
  ],
  [
    "This prompt is straightforward and does not need alternative comparisons.",
    "该提示词清晰直接，无需进行候选对比。"
  ],
  [
    "Configure workspace-specific permissions, resources, and customizations.",
    "配置当前工作区的专属权限、资源和自定义项。"
  ],
  [
    "Controls whether terminal commands require your approval before running.",
    "控制终端命令在运行前是否需要您的批准。"
  ],
  [
    "Enter the SSO URL provided by your IT admin to connect your work account",
    "输入 IT 管理员提供的单点登录 (SSO) URL 以连接您的工作账号"
  ],
  [
    "Model must be available on the Gemini API and use the gemini-api scheme.",
    "模型必须可在 Gemini API 中使用，并使用 gemini-api 模式。"
  ],
  [
    "Plugins are packaged collections of skills and MCPs to help the Agent in",
    "插件是技能与 MCP 工具的打包集合，旨在帮助智能体更高效工作"
  ],
  [
    "The Agent attempted to interact with some sites that are not allowlisted",
    "智能体尝试访问某些未在允许列表中的站点"
  ],
  [
    "Time spent by the language model generating and streaming the tool call.",
    "语言模型生成和流式传输工具调用所花费的时间。"
  ],
  [
    "Toggle if a confirmation is shown when using the \"Reload Window\" button.",
    "点击“重新加载窗口”按钮时是否弹出确认提示。"
  ],
  [
    "You can upgrade to a Google AI Ultra plan to receive higher rate limits.",
    "您可以升级到 Google AI Ultra 套餐以获得更高的速率限制。"
  ],
  [
    "Inbox: Centralized view for all notifications and urgent agent requests.",
    "收件箱：集中查看所有通知和智能体紧急审核请求的视图。"
  ],
  [
    "Browser settings have moved to the Browser section of General settings.",
    "浏览器设置已迁移至常规设置中的“浏览器”部分。"
  ],
  [
    "cogfsd and cidermux are required to create Cog workspaces. Please visit",
    "创建 Cog 工作区需要安装 cogfsd 与 cidermux。请访问"
  ],
  [
    "Contact your administrator to set up Gemini Enterprise for this project",
    "联系您的管理员以为此项目配置 Gemini 企业版"
  ],
  [
    "Google3 projects are being deprecated. Select a CitC workspace instead.",
    "Google3 项目正在弃用。请改选 CitC 工作区。"
  ],
  [
    "Path to the Chrome/Chromium executable. Leave empty for auto-detection.",
    "Chrome/Chromium 可执行文件路径。留空以自动检测。"
  ],
  [
    "This project uses Firebase. Do you want to download the Firebase skill?",
    "此项目使用 Firebase。是否需要下载 Firebase 专属技能？"
  ],
  [
    "Inherits from global settings. Local permissions have higher priority.",
    "继承自全局设置。本地权限具有更高优先级。"
  ],
  [
    "Jetski Chat configuration is not available in the current environment.",
    "当前环境中无法使用 Jetski 对话配置。"
  ],
  [
    "When enabled, sandboxed commands are allowed to make network requests.",
    "启用后，允许沙盒命令访问外部网络。"
  ],
  [
    "Configure a chat bot so you can use Jetski directly from Google Chat.",
    "配置聊天机器人，以便直接从 Google Chat 中使用 Jetski。"
  ],
  [
    "A snapshot was saved before running. To restore your previous output:",
    "运行前已自动保存快照。若要还原先前的输出："
  ],
  [
    "Agent settings and permissions for conversations outside of projects.",
    "为项目外对话配置智能体设置和权限。"
  ],
  [
    "Failed to unarchive project: project management feature not available",
    "取消归档项目失败：项目管理功能不可用"
  ],
  [
    "Generator metadata is present but does not contain ChatModelMetadata.",
    "生成器元数据存在，但未包含 ChatModelMetadata。"
  ],
  [
    "Google3 chats will be regrouped into their workspaces in the sidebar.",
    "Google3 聊天将在侧边栏中按各自的工作区重新分组。"
  ],
  [
    "Keep your coding agent up to date with the latest web best practices.",
    "让您的编码智能体始终与最新的 Web 最佳实践保持同步。"
  ],
  [
    "Please sign in using the Antigravity sidebar panel to view this page.",
    "请使用 Antigravity 侧边栏面板登录以查看此页面。"
  ],
  [
    "Plugins are packaged collections of skills and MCPs to help the Agent",
    "插件是技能与 MCP 工具的打包集合，旨在帮助智能体更高效工作"
  ],
  [
    "Shared conversations live in your x20 user directory, so readers need",
    "共享的对话存储在您的 x20 用户目录中，因此阅读者需要"
  ],
  [
    "The server cleared a prefix of the conversation as it grew too large.",
    "由于对话内容过长，服务器已自动清理了对话前缀。"
  ],
  [
    "打开 in current window, Continue conversation in the current workspace",
    "在当前窗口打开，并在当前工作区继续对话"
  ],
  [
    "Configure agent execution, queued message delivery, and permissions.",
    "配置智能体执行、排队消息传递和权限。"
  ],
  [
    "Run the command in your workstation terminal, then reload this page:",
    "请在工作站终端中运行该命令，然后重新加载此页面："
  ],
  [
    "Keep your coding agent up to date with the latest web best practices",
    "让您的编程智能体始终掌握最新的现代 Web 开发最佳实践。"
  ],
  [
    "Collect coverage using the coverage packge and create an LCOV report",
    "使用 coverage 包收集测试覆盖率并生成标准 LCOV 报告。"
  ],
  [
    "Allows the agent to access files outside of your current workspace.",
    "允许智能体访问当前工作区目录之外的文件。"
  ],
  [
    "Enter the required configuration values to install this MCP server.",
    "请输入所需的配置参数以安装此 MCP 服务器。"
  ],
  [
    "Every step packed into a lane per kind \\u2014 no rows, no scrolling",
    "每种类型整合到一个泳道 — 无需分行，无需滚动"
  ],
  [
    "No experimental features are available right now. Check back later.",
    "当前暂无可用的实验性功能，请稍后查看。"
  ],
  [
    "Project-level settings override global defaults for this workspace.",
    "项目级设置将覆盖此工作区的全局默认值。"
  ],
  [
    "Search uses smart case and will ignore gitignored files by default.",
    "搜索采用智能大小写匹配，并默认忽略被 .gitignore 排除的文件。"
  ],
  [
    "Inherits your global permissions (when working in this workspace).",
    "继承您的全局权限（当在此工作区中工作时）。"
  ],
  [
    "Agent cannot modify files outside of the workspace in strict mode.",
    "严格模式下智能体无法修改工作区之外的文件。"
  ],
  [
    "Intended primarily for previewing local development servers (e.g.,",
    "主要用于预览本地开发服务器 (例如，"
  ],
  [
    "Read access to code, refs, commits, and other repository contents.",
    "对代码、引用、提交及其他仓库内容的读取权限。"
  ],
  [
    "Run an instruction on a recurring schedule or as a one-time timer.",
    "按周期性计划或作为一次性定时器运行指令。"
  ],
  [
    "This request is not well-suited for parallel Best-of-N generation.",
    "此请求不太适合进行并行的 Best-of-N 多候选生成。"
  ],
  [
    "To modify editor settings, open Settings within the editor window.",
    "若要修改编辑器设置，请在编辑器窗口内打开设置。"
  ],
  [
    "Typing your corp password here may trigger a Password Alert reset.",
    "在此输入企业密码可能会触发密码重置警报。"
  ],
  [
    "Inherits your global permissions (when working in this workspace)",
    "继承您的全局权限（当在此工作区中工作时）。"
  ],
  [
    "A shell setup script run before every command the agent executes.",
    "在智能体执行每条终端命令之前运行的 Shell 环境初始化脚本。"
  ],
  [
    "Click to go there, drag to select a range, drag an edge to resize",
    "点击跳转，拖拽选择范围，拖拽边缘以调整大小"
  ],
  [
    "Commands the agent can run outside the sandbox in this workspace.",
    "智能体可在本工作区沙盒外运行的命令。"
  ],
  [
    "Show \"Edit\" and \"Chat\" buttons when selecting text in the editor.",
    "在编辑器中选中文本时显示“编辑”和“聊天”悬浮按钮。"
  ],
  [
    "Want to re-group your old conversations by workspace? They can be",
    "想要按工作区重新分组历史对话吗？它们可以被"
  ],
  [
    "Secure Mode: Enhances privacy and restricts certain data sharing.",
    "安全隔离模式：增强隐私保护并限制特定外部数据共享。"
  ],
  [
    "Inherits your global permissions (when working in this project).",
    "继承您的全局权限（当在此项目中工作时）。"
  ],
  [
    "Replace the default browser right-click menu with quick actions.",
    "使用快捷操作替换默认浏览器右键菜单。"
  ],
  [
    "Ask a quick question without interrupting the main conversation.",
    "在不打断主对话的情况下快速提问。"
  ],
  [
    "Let the agent access past conversations to inform its responses.",
    "允许智能体访问历史对话以辅助其生成回复。"
  ],
  [
    "New conversations in CitC will be grouped by distinct workspace.",
    "CitC 中的新对话将按不同的工作区分组显示。"
  ],
  [
    "One row per step, in order \\u2014 scroll to move through the run",
    "按顺序每行一个步骤 — 滚动以查看运行过程"
  ],
  [
    "Simulate a different user cohort (Google, External, Enterprise).",
    "模拟不同的用户群体 (Google、外部、企业)。"
  ],
  [
    "The agent auto-executes commands matched by an allow list entry.",
    "智能体会自动执行与白名单条目匹配的命令，无需额外确认。"
  ],
  [
    "This extension has no declared permissions requiring user input.",
    "此扩展未声明任何需要用户确认的权限。"
  ],
  [
    "Curated collection of agent skills for science that help with...",
    "面向科学领域的精选智能体技能合集..."
  ],
  [
    "Inherits your global permissions (when working in this project)",
    "继承您的全局权限（当在此项目中工作时）。"
  ],
  [
    "Agents have full access to your machine and external resources.",
    "智能体对您的计算机和外部资源拥有完全访问权限。"
  ],
  [
    "Allow/deny agent write access to specific files or directories.",
    "允许或拒绝智能体写入指定文件或目录。"
  ],
  [
    "Configure tab completion, suggestions, and navigation behavior.",
    "配置 Tab 补全、代码建议与导航行为。"
  ],
  [
    "Drag to resize the gutter; double-click to fit it automatically",
    "拖动以调整边栏大小；双击自动适应"
  ],
  [
    "Highlight newly inserted text after accepting a Tab completion.",
    "在接受 Tab 补全后高亮显示新插入的文本。"
  ],
  [
    "Manage settings specific to Google CitC workspaces development.",
    "管理适用于 Google CitC 工作区开发的特定设置。"
  ],
  [
    "Open files in the background if the agent creates or edits them",
    "当智能体创建或编辑文件时在后台静默打开"
  ],
  [
    "Your administrator has disabled MCP servers for this workspace.",
    "您的管理员已在此工作区中禁用了 MCP 服务器。"
  ],
  [
    "Inherits your Global Permissions when working in this project.",
    "在此项目中工作时继承您的全局权限。"
  ],
  [
    "Inherits your global permissions when working in this project.",
    "在此项目中工作时继承您的全局权限。"
  ],
  [
    "Allow/deny agent read access to specific files or directories.",
    "允许或拒绝智能体读取指定文件或目录。"
  ],
  [
    "Curated collection of agent skills for modern web development.",
    "精选的现代 Web 全栈开发智能体技能合集。"
  ],
  [
    "Every step packed into a lane per kind — no rows, no scrolling",
    "每种类型整合到一个泳道 — 无需分行，无需滚动"
  ],
  [
    "Invoke a team of agents to autonomously tackle large projects.",
    "调用智能体团队自主处理大型项目。"
  ],
  [
    "Tip: Complex tasks get better results with multiple responses.",
    "提示：复杂任务通过多路回复可获得更好的结果。"
  ],
  [
    "Your Antigravity use will be associated with provided project.",
    "您对 Antigravity 的使用将与提供的项目相关联。"
  ],
  [
    "Inherits your Global Permissions when working in this project",
    "在此项目中工作时继承您的全局权限"
  ],
  [
    "Inherits your global permissions when working in this project",
    "在此项目中工作时继承您的全局权限"
  ],
  [
    "ABFS workspace creation is not available in this environment.",
    "当前环境不支持创建 ABFS 工作区。"
  ],
  [
    "Allow opening pull requests and grant access to specific PRs.",
    "允许创建拉取请求 (PR) 并授予对特定 PR 的访问权限。"
  ],
  [
    "Browse and enable plugins from the Build With Google catalog.",
    "从 Build With Google 目录浏览并启用插件。"
  ],
  [
    "Concierge is listening \\u2014 open the Concierge conversation",
    "Concierge 助手正在待命 — 打开 Concierge 对话"
  ],
  [
    "Configure allowed and denied paths for file reads and writes.",
    "配置允许和禁止读取及修改的文件路径。"
  ],
  [
    "Create or select a CitC workspace to use in this conversation",
    "创建或选择用于此对话的 CitC 工作区"
  ],
  [
    "External tools the agent can call via Model Context Protocol.",
    "智能体可通过 Model Context Protocol 调用的外部工具。"
  ],
  [
    "Hook will only trigger if the tool name starts with browser_.",
    "只有当工具名称以 browser_ 开头时才会触发钩子。"
  ],
  [
    "The agent will wait for you to install the browser extension.",
    "智能体会等待你安装浏览器扩展。"
  ],
  [
    "This migration may mess up your settings, chats, and sidebar.",
    "此迁移可能会影响您的设置、聊天记录和侧边栏布局。"
  ],
  [
    "Use switch expressions and pattern matching where appropriate",
    "在合适的位置优先使用 switch 表达式与模式匹配。"
  ],
  [
    "Disables all safety barriers for maximal iteration velocity.",
    "禁用所有安全屏障以获得最大迭代速度。"
  ],
  [
    "Cog workspace creation is not available in this environment.",
    "当前环境不支持创建 Cog 工作区。"
  ],
  [
    "Configure the agent\\'s visual theme and display preferences.",
    "配置智能体的视觉主题与显示偏好。"
  ],
  [
    "Confirming this undo action will make the following changes:",
    "确认撤销操作将执行以下更改："
  ],
  [
    "Grant create, update, or delete access to specific branches.",
    "授予对特定分支的创建、更新或删除权限。"
  ],
  [
    "Hook will only trigger if the tool name matches run_command.",
    "只有当工具名称匹配 run_command 时才会触发钩子。"
  ],
  [
    "Invoke the Boost multi-agent orchestrator for complex tasks.",
    "调用 Boost 多智能体编排器处理复杂任务。"
  ],
  [
    "Manage how Best of N sets up the workspaces its arms run in.",
    "管理 Best-of-N 分支工作区的创建与运行环境。"
  ],
  [
    "Prevent the computer from sleeping while the app is running.",
    "应用运行时防止电脑进入休眠状态。"
  ],
  [
    "Within any of the customization roots above, you can define:",
    "在上述任意自定义根目录中，您可以定义："
  ],
  [
    "Disables all safety barriers for maximal iteration velocity",
    "禁用所有安全屏障以获得最大迭代速度"
  ],
  [
    "Allow/deny agent browser actuation access to specific URLs.",
    "允许/禁止智能体对特定 URL 进行浏览器操作。"
  ],
  [
    "Configure the agent's visual theme and display preferences.",
    "配置智能体的视觉主题与显示偏好。"
  ],
  [
    "One row per step, in order — scroll to move through the run",
    "按顺序每行一个步骤 — 滚动以查看运行过程"
  ],
  [
    "Open files in the background if Agent creates or edits them",
    "当智能体创建或编辑文件时在后台静默打开"
  ],
  [
    "Pick a suggestion below to get started, or ask me anything.",
    "从下方选择一个建议开始，或直接向我提问。"
  ],
  [
    "Play a sound when the agent finishes generating a response.",
    "智能体完成回复生成时播放声音提示。"
  ],
  [
    "These MCP allowlist rules are enforced by your organization",
    "这些 MCP 允许列表规则由您的组织机构强制实施"
  ],
  [
    "To modify notification settings, open your operating system",
    "若要修改通知设置，请打开您的操作系统设置"
  ],
  [
    "These settings apply across all projects and conversations:",
    "以下设置全局应用于所有项目和对话："
  ],
  [
    "Here is what the subagent accomplished before cancellation:",
    "智能体在被取消前已完成的工作如下："
  ],
  [
    "Here is what the subagent accomplished before interruption:",
    "智能体在被中断前已完成的工作如下："
  ],
  [
    "Remote Control isn't active on this instance. Enable it in",
    "此实例未启用远程控制。请在此处启用："
  ],
  [
    "Restricts agent tools to a secure, isolated local sandbox.",
    "将智能体工具限制在安全隔离的本地沙盒中。"
  ],
  [
    "Sharing is a preview feature. It exports this conversation",
    "共享为预览功能。它将导出此对话"
  ],
  [
    "Terminal commands the agent can execute in this workspace.",
    "智能体可在本工作区内执行的终端命令。"
  ],
  [
    "To use browser tools, you need to enable remote debugging:",
    "若要使用浏览器工具，您需要启用远程调试功能："
  ],
  [
    "Using the Google Antigravity Python SDK to build AI agents",
    "使用 Google Antigravity Python SDK 构建强大的自主 AI 智能体。"
  ],
  [
    "Enable \"allow remote debugging for this browser instance\".",
    "启用“允许此浏览器实例的远程调试”。"
  ],
  [
    "Enable \"Allow remote debugging for this browser instance\".",
    "启用“允许此浏览器实例的远程调试”。"
  ],
  [
    "Here is a preview with the middle of the output truncated:",
    "以下是输出预览（中间部分已省略截断）："
  ],
  [
    "Core tools and knowledge required to develop for Android.",
    "开发 Android 所需的核心工具与知识。"
  ],
  [
    "A comma-separated list like repo-a, repo-b, or * for all.",
    "逗号分隔的列表（如 repo-a, repo-b 或 * 表示全部）。"
  ],
  [
    "Agent can scroll on browser pages to access more content.",
    "智能体可以在网页上滚动浏览以获取更多页面内容。"
  ],
  [
    "Allow/deny agent read access to specific URLs or domains.",
    "允许或拒绝智能体读取指定 URL 或域名。"
  ],
  [
    "Command and file access granted to the automation agents.",
    "授予自动化智能体的命令与文件访问权限。"
  ],
  [
    "Configure global allowed and denied resource permissions.",
    "配置全局允许和拒绝的资源权限。"
  ],
  [
    "No matching project folders. Apply to use the custom URI.",
    "未找到匹配的项目文件夹。请应用以使用自定义 URI。"
  ],
  [
    "Core tools and knowledge required to develop for Android",
    "进行 Android 应用程序开发所需的核心命令行工具与知识库。"
  ],
  [
    "ABFS is required to create ABFS workspaces. Please visit",
    "创建 ABFS 工作区需要 ABFS。请访问"
  ],
  [
    "Active token streaming duration from the language model.",
    "语言模型的活跃 Token 流式传输持续时间。"
  ],
  [
    "Clone current workspace into a new independent workspace",
    "将当前工作区克隆为全新的独立工作区"
  ],
  [
    "Concierge is listening — open the Concierge conversation",
    "Concierge 助手正在待命 — 打开 Concierge 对话"
  ],
  [
    "Configure allowed and denied URLs for browser actuation.",
    "配置允许和禁止浏览器操作的 URL。"
  ],
  [
    "Enter a project ID above to check for assigned licenses.",
    "在上方输入项目 ID 以检查已分配的许可证。"
  ],
  [
    "Manage project folders, agent settings, and permissions.",
    "管理项目文件夹、智能体设置和权限。"
  ],
  [
    "No project selected or project management not available.",
    "未选择项目或项目管理功能不可用。"
  ],
  [
    "Trigger multiple response variants from the same prompt.",
    "根据同一提示词触发多个候选回复变体。"
  ],
  [
    "Here is what the subagent accomplished before the error:",
    "智能体在遇到错误前已完成的工作如下："
  ],
  [
    "Browser subagent was interrupted due to server shutdown.",
    "由于服务关闭，浏览器子智能体已中断执行。"
  ],
  [
    "A comma-separated list like org-a, org-b, or * for all.",
    "逗号分隔的列表（如 org-a, org-b 或 * 表示全部）。"
  ],
  [
    "Allow/deny agent command execution outside the sandbox.",
    "允许或拒绝智能体在沙盒外执行命令。"
  ],
  [
    "Describe the plugin you want and let the agent build it",
    "描述您需要的插件，让智能体为您构建"
  ],
  [
    "Include default customizations, such as default skills.",
    "包含预置的默认自定义项，例如内置技能。"
  ],
  [
    "Manage your plan, credentials, and general preferences.",
    "管理您的订阅计划、凭证和通用首选项。"
  ],
  [
    "Pay as you go provisioned for your Google Cloud project",
    "已为您的 Google Cloud 项目开通按需即付 (Pay-as-you-go)"
  ],
  [
    "Scan the code to open this device in Remote Control, or",
    "扫描二维码在远程控制中打开此设备，或"
  ],
  [
    "These allowed domain rules are set by your organization",
    "这些允许的域名访问规则由您的组织机构制定"
  ],
  [
    "This sign-in option is only available to invited teams.",
    "此登录选项仅对受邀团队开放。"
  ],
  [
    "Your existing conversations in CitC are grouped under a",
    "您在 CitC 中的现有对话被分组在"
  ],
  [
    "Allow full browser script execution without prompting.",
    "允许完整运行浏览器脚本且不提示。"
  ],
  [
    "Configure the maximum width of the conversation panel.",
    "配置对话面板的最大显示宽度。"
  ],
  [
    "Creating CitC workspace for the forked conversation...",
    "正在为分支对话创建 CitC 工作区..."
  ],
  [
    "cumulative total for the conversation up to this point",
    "截至此处的对话累计总量"
  ],
  [
    "Describe your changes, or leave empty to auto-generate",
    "描述您的更改，或留空以自动生成提交信息"
  ],
  [
    "No rate card for this model; showing comparable rates.",
    "此模型无专属价目表；显示相近费率。"
  ],
  [
    "There was an unexpected issue setting up your account.",
    "设置您的账号时出现意外错误。"
  ],
  [
    "Each project can override a subset of global settings.",
    "每个项目都可以单独覆盖部分全局设置。"
  ],
  [
    "Choose between the Default and Project 4K experience.",
    "在默认与项目 4K 体验之间进行选择。"
  ],
  [
    "Both staged and unstaged changes are being committed.",
    "将同时提交暂存区与工作区的更改。"
  ],
  [
    "Configure default behaviors, skills, and MCP servers.",
    "配置默认行为、技能以及 MCP 服务器。"
  ],
  [
    "How long a quiet interval must be before it collapses",
    "折叠前允许的最大静默间隔时间"
  ],
  [
    "Manage your conversations from the companion website.",
    "从配套移动端网页管理您的对话。"
  ],
  [
    "Modify permissions for file, terminal, and MCP tools.",
    "修改文件、终端和 MCP 工具的权限。"
  ],
  [
    "Collapse (shift+click to collapse every level below)",
    "折叠 (按住 Shift 点击可折叠下方所有层级)"
  ],
  [
    "Configure external tools via Model Context Protocol.",
    "通过模型上下文协议 (MCP) 配置外部工具。"
  ],
  [
    "Keyboard shortcuts for quick navigation and control.",
    "用于快速导航与控制的键盘快捷键。"
  ],
  [
    "Run until the specified goal is completely finished.",
    "持续运行，直至指定目标完全完成。"
  ],
  [
    "What did you like? Select any that apply (optional).",
    "您觉得哪些方面不错？选择适用项（可选）。"
  ],
  [
    "You currently don\\'t have any MCP Servers installed.",
    "您当前还没有安装任何 MCP 服务器。"
  ],
  [
    "Alternatively, request the agent to add the skills:",
    "或者，直接让智能体为您添加对应技能："
  ],
  [
    "Configure hooks that run on agent lifecycle events.",
    "配置在智能体生命周期事件上运行的钩子。"
  ],
  [
    "Prompt for approval before running browser scripts.",
    "在运行浏览器脚本前提示审批。"
  ],
  [
    "Quickly add and update imports with a tab keypress.",
    "按下 Tab 键快速添加和更新导入。"
  ],
  [
    "Search for MCP servers to add to your configuration",
    "搜索要添加到配置中的 MCP 服务器"
  ],
  [
    "Standalone skills, rules, and MCP servers that aren",
    "未分组的独立技能、规则和 MCP 服务器"
  ],
  [
    "Toggle this on to allow creating new pull requests.",
    "开启此项以允许创建新的拉取请求。"
  ],
  [
    "Using the Antigravity Python SDK to build AI agents",
    "使用 Antigravity Python SDK 构建 AI 智能体"
  ],
  [
    "Whether the agent asks you to review its documents.",
    "智能体在生成文档时是否请求您审核。"
  ],
  [
    "Why are you opting out of auto-triggered Best-of-N?",
    "您为何选择停用自动触发的多候选对比 (Best-of-N)？"
  ],
  [
    "Prototype, build & run modern apps that users love.",
    "原型设计、构建并运行用户喜爱的现代应用程序。"
  ],
  [
    "Curated collection of agent skills for science t...",
    "面向科学领域的精选智能体技能合集，助力数据分析、建模与科研..."
  ],
  [
    "Add an optional message, \\u23ce to submit comments",
    "添加可选消息，按 ⏎ 提交评论"
  ],
  [
    "Allow sandboxed commands to make network requests.",
    "允许沙盒内的命令发起网络请求。"
  ],
  [
    "Configure editor-specific behaviors and shortcuts.",
    "配置编辑器专属行为与快捷键。"
  ],
  [
    "Custom agents are not available in Best of N mode.",
    "自定义智能体在 Best of N 模式下不可用。"
  ],
  [
    "Error: No artifact URI provided in URL parameters.",
    "错误：URL 参数中未提供产物 URI。"
  ],
  [
    "No license available for this project and location",
    "此项目与位置无可用许可证"
  ],
  [
    "URLs the agent can read or open in this workspace.",
    "智能体可在本工作区读取或打开的 URL。"
  ],
  [
    "Whether the agent asks you to review its documents",
    "智能体是否在生成文档时请求您审核"
  ],
  [
    "Dev mode: Localhost server automatically detected",
    "开发模式: 已自动检测到本地服务器"
  ],
  [
    "Display and preserve intermediate thinking steps.",
    "显示并保留中间的思维链思考步骤。"
  ],
  [
    "For Antigravity Business consumption options, see",
    "有关 Antigravity 商业版的使用选项，请参阅"
  ],
  [
    "New standalone conversation, outside of projects.",
    "新建独立对话，不属于任何项目。"
  ],
  [
    "Paths the agent can modify inside this workspace.",
    "智能体可在本工作区内修改的文件路径。"
  ],
  [
    "The agent was prevented from accessing some sites",
    "智能体已被阻止访问部分网站"
  ],
  [
    "This workspace adds no customizations of its own.",
    "此工作区未添加任何自定设置。"
  ],
  [
    "Time waiting before the first token was received.",
    "接收首个 Token 前的等待耗时。"
  ],
  [
    "Toggle this on to enable read access on contents.",
    "开启此项以允许读取内容。"
  ],
  [
    "Creating worktree for the forked conversation...",
    "正在为分支对话创建工作树..."
  ],
  [
    "Display and preserve intermediate thinking steps",
    "显示并保留中间思考步骤"
  ],
  [
    "Expand (shift+click to expand every level below)",
    "展开 (按住 Shift 点击可展开下方所有层级)"
  ],
  [
    "Files modified by the agent in this conversation",
    "智能体在本次对话中修改的文件"
  ],
  [
    "Import feature is not available in this context.",
    "当前上下文中无法使用导入功能。"
  ],
  [
    "No steps with timestamps to place on a timeline.",
    "没有带时间戳的步骤可放置在时间轴上。"
  ],
  [
    "Opens in the in-app preview pane. Some sites don",
    "在应用内预览窗格中打开。部分站点不支持"
  ],
  [
    "Run terminal commands with sandbox restrictions.",
    "在沙盒隔离限制下运行终端命令。"
  ],
  [
    "Steps and containers shorter than this fade back",
    "短于此阈值的步骤和容器将淡化显示"
  ],
  [
    "This undo action will not make any code changes.",
    "此撤销操作不会对代码做任何修改。"
  ],
  [
    "Toggle if a confirmation is shown when using the",
    "切换使用时是否弹出确认提示"
  ],
  [
    "URLs the agent can actuate on in this workspace.",
    "智能体可在本工作区使用浏览器操作的 URL。"
  ],
  [
    "URLs the agent can actuate on using the browser.",
    "智能体可以使用浏览器进行操作的 URL。"
  ],
  [
    "allow remote debugging for this browser instance",
    "允许此浏览器实例的远程调试"
  ],
  [
    "Allow remote debugging for this browser instance",
    "允许此浏览器实例的远程调试"
  ],
  [
    "Project 4K interface without developer tooling.",
    "无开发工具的 4K 纯净界面。"
  ],
  [
    "Absolute path to the Chrome/Chromium executable",
    "Chrome/Chromium 可执行文件的绝对路径"
  ],
  [
    "Agent will always ask to review in strict mode.",
    "严格模式下智能体将始终请求人工审核。"
  ],
  [
    "Commands the agent can run outside the sandbox.",
    "智能体可以在沙盒外部运行的命令。"
  ],
  [
    "Configure allowed commands outside the sandbox.",
    "配置允许在沙盒外运行的命令。"
  ],
  [
    "Curated collection of agent skills for science.",
    "为科学领域精心挑选的智能体技能集合。"
  ],
  [
    "One lane per kind of step, or one per step type",
    "每种步骤类型单独占一条泳道"
  ],
  [
    "Paths the agent can read inside this workspace.",
    "智能体可在本工作区内读取的文件路径。"
  ],
  [
    "Select light, dark, or inherit system settings.",
    "选择浅色、深色或继承系统设置。"
  ],
  [
    "This step is not associated with an invocation.",
    "此步骤不关联任何调用。"
  ],
  [
    "Timed out waiting for commit message generation",
    "生成提交信息超时"
  ],
  [
    "URLs the agent can read or open in the browser.",
    "智能体可以在浏览器中读取或打开的 URL。"
  ],
  [
    "What was off? Select any that apply (optional).",
    "有哪些不符合预期？选择适用项（可选）。"
  ],
  [
    "Prototype, build & run modern apps that user...",
    "原型设计、构建并运行现代应用程序..."
  ],
  [
    "(Optional) Tell us more or type your reason...",
    "（可选）提供更多信息或输入原因..."
  ],
  [
    "Alt+Enter On empty prompt, sends next in queue",
    "提示词为空时按 Alt+Enter 发送队列中的下一条"
  ],
  [
    "Cannot revert messages with file diff comments",
    "无法撤回包含文件差异评论的消息"
  ],
  [
    "Close split view and go to forked conversation",
    "关闭拆分视图并前往分支对话"
  ],
  [
    "Configure allowed and denied URLs for reading.",
    "配置允许和禁止读取的 URL 地址。"
  ],
  [
    "Continue conversation in the current workspace",
    "在当前工作区继续对话"
  ],
  [
    "Encountered an error while running the plugin.",
    "运行插件时发生错误。"
  ],
  [
    "No execution metadata available for this step.",
    "此步骤无可用执行元数据。"
  ],
  [
    "Type to search for code across your workspace.",
    "输入以在整个工作区中搜索代码。"
  ],
  [
    "Check availability, schedule events, and RSVP.",
    "查看空闲状态、安排日程与活动答复。"
  ],
  [
    "Choose the experience that fits how you work.",
    "选择适合您工作方式的体验。"
  ],
  [
    "Add an optional message, ⏎ to submit comments",
    "添加可选消息，按 ⏎ 提交评论"
  ],
  [
    "Cannot revert messages with artifact comments",
    "无法撤回包含产物评论的消息"
  ],
  [
    "Determines the markup language of the output.",
    "决定输出产物的标记语言。"
  ],
  [
    "Failed to load repository status (git status)",
    "加载仓库状态失败 (git status)"
  ],
  [
    "Image rendering blocked (strict mode enabled)",
    "图片渲染已被阻止 (已启用严格模式)"
  ],
  [
    "Scan the code to open this device in 远程控制, or",
    "扫描二维码在远程控制中打开此设备，或"
  ],
  [
    "Staged index changes and working tree changes",
    "暂存区更改与工作区更改"
  ],
  [
    "This client was started with no custom flags.",
    "此客户端启动时未附加任何自定义标志。"
  ],
  [
    "Check availability, schedule events, and RSVP",
    "查看空闲状态、安排日程与活动答复"
  ],
  [
    "Search conversations with 🔍 in the top left.",
    "使用左上角的放大镜图标搜索历史会话。"
  ],
  [
    "Please list the steps to reproduce the issue",
    "请详细列出复现该问题的具体步骤"
  ],
  [
    "Allow the agent to run without restrictions.",
    "允许智能体无限制自主执行。"
  ],
  [
    "Ask for permission for sensitive operations.",
    "对敏感操作请求授权确认。"
  ],
  [
    "Conversation copied as Markdown to clipboard",
    "对话已作为 Markdown 复制到剪贴板"
  ],
  [
    "Please verify your account to continue using",
    "请验证您的账号以继续使用"
  ],
  [
    "Search conversations (by name or Cascade ID)",
    "搜索对话 (按名称或 Cascade ID)"
  ],
  [
    "Select text in the artifact to add a comment",
    "在产物中选中文本以添加批注"
  ],
  [
    "Set of default skills to run the Agent with.",
    "智能体运行所使用的默认技能集。"
  ],
  [
    "Some non-image binary content was truncated.",
    "部分非图像二进制内容已被截断。"
  ],
  [
    "The agent can perform actions on your behalf",
    "智能体可以代表您执行操作"
  ],
  [
    "Toggle this on to allow creating new issues.",
    "开启此项以允许创建新 Issue。"
  ],
  [
    "Worktrees are available for Git repositories",
    "工作树 (Worktree) 仅适用于 Git 仓库"
  ],
  [
    "Are you sure you want to reset all settings?",
    "您确定要将所有设置恢复为出厂默认值吗？"
  ],
  [
    "Files modified by agent in this conversation",
    "智能体在本次对话中修改的文件"
  ],
  [
    "to back up your data and run the migration.",
    "备份您的数据并运行迁移。"
  ],
  [
    "% of the customization budget is available.",
    "% 的自定义预算可用。"
  ],
  [
    "Configure the browser subagent. It requires",
    "配置浏览器子智能体。它需要"
  ],
  [
    "Configure when follow-up messages are sent.",
    "配置后续跟进消息的发送时机。"
  ],
  [
    "Enter workspace name (e.g., my-cog-feature)",
    "输入工作区名称（例如 my-cog-feature）"
  ],
  [
    "Manage fine-grained permissions for GitHub.",
    "管理 GitHub 的细粒度权限。"
  ],
  [
    "No active terminals. Click + to create one.",
    "暂无活动终端。点击 + 创建新终端。"
  ],
  [
    "No customizations found for this workspace.",
    "此工作区没有找到自定义内容。"
  ],
  [
    "This plugin does not add any agent scripts.",
    "此插件未添加任何智能体脚本。"
  ],
  [
    "Work with local agents from another device.",
    "在其他设备上与本地智能体协同工作。"
  ],
  [
    "Antigravity would like to use the browser.",
    "Antigravity 想要使用浏览器。"
  ],
  [
    "Confirmation required to execute this step",
    "执行此步骤需要确认"
  ],
  [
    "Failed to load commits from the repository",
    "从代码仓库加载提交记录失败"
  ],
  [
    "Folder no longer exists or is unavailable.",
    "文件夹不再存在或不可用。"
  ],
  [
    "Hook will trigger if any tool is executed.",
    "执行任何工具时均会触发钩子。"
  ],
  [
    "It requires Google Chrome to be installed.",
    "它需要安装 Google Chrome。"
  ],
  [
    "Select a suggested slash command to try it",
    "选择推荐的斜杠命令以尝试"
  ],
  [
    "Show suggestions when typing in the editor",
    "在编辑器中键入时显示补全建议"
  ],
  [
    "remote debugging for this browser instance",
    "此浏览器实例的远程调试"
  ],
  [
    "Yes, and always allow in this conversation",
    "是，且在此对话中永久允许"
  ],
  [
    "Interrupt the agent and send immediately.",
    "打断智能体并立即发送。"
  ],
  [
    "An unexpected error occurred during check",
    "检查过程中发生了意外错误"
  ],
  [
    "Ask anything, @ to mention, / for actions",
    "提出任何问题，输入 @ 提及，/ 执行操作"
  ],
  [
    "Cannot revert messages with file comments",
    "无法撤回包含文件评论的消息"
  ],
  [
    "Enter the token provided by your IT admin",
    "输入 IT 管理员提供的访问令牌"
  ],
  [
    "Every terminal command requires approval.",
    "每条终端命令都需要您批准后执行。"
  ],
  [
    "Failed to save modified agent script file",
    "保存修改后的智能体脚本文件失败"
  ],
  [
    "Folders the automation agents can access.",
    "自动化智能体可以访问的文件夹。"
  ],
  [
    "No rules currently active in this session",
    "当前会话中暂无处于活动状态的规则"
  ],
  [
    "Team of subagents to do long running work",
    "由多个子智能体组成团队执行长时间运行的任务"
  ],
  [
    "The model didn't return any token counts.",
    "模型未返回任何 Token 计数。"
  ],
  [
    "Toggle this on to allow modifying issues.",
    "开启此项以允许修改 Issue。"
  ],
  [
    "Type absolute path or navigate folders...",
    "输入绝对路径或浏览选择文件夹..."
  ],
  [
    "Click to see all (shift+click to expand)",
    "点击查看全部 (按住 Shift 点击展开)"
  ],
  [
    "Configure AI models and view your quota.",
    "配置 AI 模型并查看您的使用额度。"
  ],
  [
    "Configure browser subagents. It requires",
    "配置浏览器子智能体。它需要"
  ],
  [
    "Controls the actions the agent can take.",
    "控制智能体可以执行的操作范围。"
  ],
  [
    "Enter a URL (e.g. http://localhost:8080)",
    "输入网址（例如 http://localhost:8080）"
  ],
  [
    "Manage hooks, skills, agents, rules, and",
    "管理钩子、技能、智能体、规则以及"
  ],
  [
    "Multi-conversation view is not available",
    "多对话视图不可用"
  ],
  [
    "Only staged changes are being committed.",
    "仅提交暂存区的更改。"
  ],
  [
    "Organization Allowed Domains (Read-Only)",
    "组织允许的域名 (只读)"
  ],
  [
    "Select a step in the timeline to inspect",
    "在时间轴中选择一个步骤以供检查"
  ],
  [
    "Terminal commands the agent can execute.",
    "智能体可以执行的终端命令。"
  ],
  [
    "Manually customize individual settings.",
    "手动自定义各项设置。"
  ],
  [
    "⌥⏎ On empty prompt, sends next in queue",
    "提示词为空时按 ⌥⏎ 发送队列中的下一条"
  ],
  [
    "Allow/deny agent network access to URLs",
    "允许或拒绝智能体访问指定网络 URL"
  ],
  [
    "Block all browser JavaScript execution.",
    "阻止所有浏览器 JavaScript 执行。"
  ],
  [
    "Configure browser subagent. It requires",
    "配置浏览器子智能体。它需要"
  ],
  [
    "Controls the actions the agent can take",
    "控制智能体可以执行的操作"
  ],
  [
    "Enter workspace name (e.g., my-feature)",
    "输入工作区名称（例如 my-feature）"
  ],
  [
    "Explain and Fix in Current Conversation",
    "在当前对话中解释并修复"
  ],
  [
    "GCP Project ID for enterprise features.",
    "适用于企业级功能的 GCP 项目 ID。"
  ],
  [
    "Local permissions have higher priority.",
    "本地权限具有更高优先级。"
  ],
  [
    "The remote shared a link for this push.",
    "远程仓库为此次推送共享了链接。"
  ],
  [
    ", and always allow in this conversation",
    "，且在此对话中永久允许"
  ],
  [
    "Yes, and always allow in this workspace",
    "是，且在此工作区中永久允许"
  ],
  [
    "Manually customize individual settings",
    "手动自定义各项设置"
  ],
  [
    "A group with this name already exists.",
    "已存在同名分组。"
  ],
  [
    "Allow/deny specific terminal commands.",
    "允许或拒绝指定终端命令。"
  ],
  [
    "Enter a file path or pattern to search",
    "输入文件路径或通配符以进行搜索"
  ],
  [
    "Enter a prompt for the agent to run...",
    "输入供智能体运行的提示词..."
  ],
  [
    "Failed to add skill. Please try again.",
    "添加技能失败。请重试。"
  ],
  [
    "Google Drive integration not available",
    "Google 云端硬盘集成不可用"
  ],
  [
    "No (tell the agent what to do instead)",
    "否（告知智能体改做什么）"
  ],
  [
    "Use theme to be imported with settings",
    "使用随设置导入的界面主题"
  ],
  [
    "View archived in the sidebar (≡ menu).",
    "在侧边栏（≡ 菜单）中查看已归档会话。"
  ],
  [
    "Cannot save a branch without a folder",
    "无法保存没有文件夹的分支"
  ],
  [
    "Drag to resize, double-click to reset",
    "拖动以调整大小，双击以重置"
  ],
  [
    "Failed to create CitC clone workspace",
    "创建 CitC 克隆工作区失败"
  ],
  [
    "Include Jetski Default Customizations",
    "包含 Jetski 默认自定义配置"
  ],
  [
    "Invoke a browser agent for web tasks.",
    "调用浏览器智能体执行网页任务。"
  ],
  [
    "Manage your notification preferences.",
    "管理您的通知首选项。"
  ],
  [
    "Open the agent panel on window reload",
    "窗口重新加载时打开智能体面板"
  ],
  [
    "Outer App Version | Inner App Version",
    "外部应用版本 | 内部应用版本"
  ],
  [
    "Outside of folders file access policy",
    "项目文件夹外部的文件访问策略"
  ],
  [
    "Select where to open the conversation",
    "选择在哪里打开对话"
  ],
  [
    "The current trigger rate is too high.",
    "当前触发频率过高。"
  ],
  [
    "and always allow in this conversation",
    "且在此对话中永久允许"
  ],
  [
    "Yes, and always allow in this project",
    "是，且在此项目中永久允许"
  ],
  [
    "Tied directly to your individual tier",
    "直接与您的个人套餐等级绑定"
  ],
  [
    "Read, write, and format spreadsheets.",
    "读取、编写与格式化电子表格。"
  ],
  [
    "Read, edit, and export presentations.",
    "读取、编辑与导出演示文稿。"
  ],
  [
    "Configure allowed terminal commands.",
    "配置允许的终端命令。"
  ],
  [
    "Failed to load CitC workspace status",
    "加载 CitC 工作区状态失败"
  ],
  [
    "Manage your model quota and credits.",
    "管理您的模型配额与点数。"
  ],
  [
    "On empty prompt, sends next in queue",
    "提示词为空时发送队列中的下一条"
  ],
  [
    "There are no custom skills available",
    "暂无自定义技能可用"
  ],
  [
    "There are no customizations enabled.",
    "当前未启用任何自定义项。"
  ],
  [
    "This hook does not accept any inputs",
    "此钩子不接受任何输入参数"
  ],
  [
    "This plugin does not add any skills.",
    "此插件未添加任何技能。"
  ],
  [
    "True changes vs the parent workspace",
    "相对于父工作区的真实更改"
  ],
  [
    "Try selecting a different workspace.",
    "尝试选择其他工作区。"
  ],
  [
    ", and always allow in this workspace",
    "，且在此工作区中永久允许"
  ],
  [
    "Staged and working directory changes",
    "暂存区更改与工作区更改"
  ],
  [
    "Read, write, and format spreadsheets",
    "读取、编写与格式化电子表格"
  ],
  [
    "Read, edit, and export presentations",
    "读取、编辑与导出演示文稿"
  ],
  [
    "Queue until after the current turn.",
    "在本轮对话后排队。"
  ],
  [
    "Describe the bug you encountered...",
    "请描述您遇到的错误..."
  ],
  [
    "Browser Javascript Execution Policy",
    "浏览器 JavaScript 执行策略"
  ],
  [
    "By using this app, you agree to its",
    "使用本应用即表示你同意其"
  ],
  [
    "Enter command (e.g., git, blaze)...",
    "输入命令（例如 git、blaze）..."
  ],
  [
    "Failed to add skills to skills.json",
    "添加技能到 skills.json 失败"
  ],
  [
    "Failed to load commits from git log",
    "从 git log 加载提交记录失败"
  ],
  [
    "Simulate running on a different OS.",
    "模拟在不同操作系统上运行。"
  ],
  [
    "(tell the agent what to do instead)",
    "（告知智能体改做什么）"
  ],
  [
    "Remote Debugging Port Configuration",
    "Chrome 远程调试端口配置"
  ],
  [
    "All changes since the branch point",
    "自分支分叉点以来的所有更改"
  ],
  [
    "Are you sure you want to revert to",
    "确定要撤销并恢复至"
  ],
  [
    "Build with Antigravity IDE Plugins",
    "使用 Antigravity IDE 插件构建"
  ],
  [
    "Failed to create agent script file",
    "创建智能体脚本文件失败"
  ],
  [
    "Failed to load shared conversation",
    "加载共享对话失败"
  ],
  [
    "Search for files in the project...",
    "在项目中搜索文件..."
  ],
  [
    "Unable to resolve audio source URL",
    "无法resolve audio source URL"
  ],
  [
    "What the step bars are coloured by",
    "步骤条颜色标识规则"
  ],
  [
    ", and always allow in this project",
    "，且在此项目中永久允许"
  ],
  [
    "and always allow in this workspace",
    "且在此工作区中永久允许"
  ],
  [
    "Are you sure you want to discard?",
    "确定要放弃未保存的更改吗？"
  ],
  [
    "Configure GitHub access policies.",
    "配置 GitHub 访问安全策略。"
  ],
  [
    "Discover helpful skills & plugins",
    "发现实用的技能与插件"
  ],
  [
    "Double-click to reset panel sizes",
    "双击以重置面板尺寸"
  ],
  [
    "Failed to fetch media for revert:",
    "获取撤回媒体资源失败:"
  ],
  [
    "Failed to Generate Commit Message",
    "生成提交信息失败"
  ],
  [
    "Initializing virtual environments",
    "正在初始化虚拟环境"
  ],
  [
    "Open Agent panel on window reload",
    "窗口重新加载时打开智能体面板"
  ],
  [
    "Use full Git clones for Best of N",
    "在多候选对比 (Best-of-N) 中使用完整 Git 克隆"
  ],
  [
    "Use full VCS clones for Best of N",
    "在多候选对比 (Best-of-N) 中使用完整 VCS 克隆"
  ],
  [
    "always allow in this conversation",
    "在此对话中永久允许"
  ],
  [
    "Always allow in this conversation",
    "在此对话中永久允许"
  ],
  [
    "tell the agent what to do instead",
    "告知智能体改做什么"
  ],
  [
    "Tell the agent what to do instead",
    "告知智能体改做什么"
  ],
  [
    "Terminal Auto-Execution Allowlist",
    "终端自动执行安全命令白名单"
  ],
  [
    "Inherits your global permissions.",
    "继承您的全局权限。"
  ],
  [
    "Create fork in current workspace",
    "在当前工作区中创建分支"
  ],
  [
    "Cron expression e.g. 0 */6 * * *",
    "Cron 表达式，例如 0 */6 * * *"
  ],
  [
    "Failed to load git branch status",
    "加载 Git 分支状态失败"
  ],
  [
    "Importing shared conversation...",
    "正在导入共享对话..."
  ],
  [
    "Interview me to align on a plan.",
    "通过模拟访谈对齐方案决策。"
  ],
  [
    "Manage Antigravity app settings.",
    "管理 Antigravity 应用设置。"
  ],
  [
    "No MCP servers currently running",
    "当前暂无运行中的 MCP 服务器"
  ],
  [
    "Prompt to execute on schedule...",
    "输入按计划定时执行的提示词..."
  ],
  [
    "Select one of the three options.",
    "选择以下三个选项之一。"
  ],
  [
    "Set the speed of tab suggestions",
    "设置 Tab 建议的显示速度"
  ],
  [
    "Sign in with a different account",
    "使用其他账号登录"
  ],
  [
    "The branch was pushed to GitLab.",
    "分支已推送到 GitLab。"
  ],
  [
    "The change was pushed to Gerrit.",
    "更改已推送到 Gerrit。"
  ],
  [
    "This command ran in the sandbox.",
    "此命令已在沙盒隔离环境中运行。"
  ],
  [
    "Type a slash command or query...",
    "输入斜杠命令或搜索关键词..."
  ],
  [
    "Use Add MCP to browse the store.",
    "使用“添加 MCP”浏览插件商店。"
  ],
  [
    "Use Google Cloud project instead",
    "改用 Google Cloud 项目"
  ],
  [
    "When enabled, Agent will use IDE",
    "启用后，智能体将优先使用当前 IDE"
  ],
  [
    "and always allow in this project",
    "且在此项目中永久允许"
  ],
  [
    "Inherits your global permissions",
    "继承您的全局权限"
  ],
  [
    "Agent Non-Workspace File Access",
    "智能体访问工作区外文件的权限"
  ],
  [
    "Allow/deny agent file access to",
    "允许或拒绝智能体访问文件："
  ],
  [
    "Alt+Enter Queues after the turn",
    "Alt+Enter 在本轮对话后排队"
  ],
  [
    "Click on a suggestion to try it",
    "点击推荐项以尝试"
  ],
  [
    "Continue with different account",
    "使用其他账号继续"
  ],
  [
    "Create fork in shared workspace",
    "在共享工作区中创建分支"
  ],
  [
    "Created a new branch on GitHub.",
    "已在 GitHub 上创建新分支。"
  ],
  [
    "Created a new branch on Origin.",
    "已在 Origin 上创建新分支。"
  ],
  [
    "Enter file or directory path...",
    "输入文件或目录路径..."
  ],
  [
    "No commit message was generated",
    "未生成提交信息"
  ],
  [
    "No quota information available.",
    "暂无配额使用信息。"
  ],
  [
    "Render display math flush left.",
    "独立行公式左对齐渲染。"
  ],
  [
    "Search by name or Cascade ID...",
    "按名称或 Cascade ID 搜索..."
  ],
  [
    "Select or enter a workspace URI",
    "选择或输入工作区 URI"
  ],
  [
    "Session expired, please refresh",
    "会话已过期，请刷新页面"
  ],
  [
    "Split Conversation Horizontally",
    "水平拆分对话"
  ],
  [
    "Terminal Command Auto Execution",
    "终端命令自动执行策略"
  ],
  [
    "User cancelled agent execution.",
    "用户已取消智能体执行。"
  ],
  [
    "Welcome to the new Antigravity!",
    "欢迎使用新版 Antigravity！"
  ],
  [
    "Workspace archived successfully",
    "工作区归档成功"
  ],
  [
    "Check for Updates Automatically",
    "后台自动检查版本更新"
  ],
  [
    "Automatically check for updates",
    "后台自动检查版本更新"
  ],
  [
    "Enable Browser Automation Tools",
    "启用浏览器自动化操作工具"
  ],
  [
    "All changes since origin/master",
    "自远程主分支以来的所有更改"
  ],
  [
    "The full developer experience.",
    "完整的开发者体验。"
  ],
  [
    "Attach a screenshot (optional)",
    "附上截图（可选）"
  ],
  [
    "Refresh quota and credits data",
    "刷新配额与点数数据"
  ],
  [
    "Attach Antigravity server logs",
    "附带 Antigravity 服务器运行日志"
  ],
  [
    "Concierge voice message failed",
    "语音助理消息发送失败"
  ],
  [
    "Concierge voice mode is active",
    "语音助理模式已激活"
  ],
  [
    "Enable Notifications for Agent",
    "启用智能体桌面通知"
  ],
  [
    "Enable Personal Customizations",
    "启用个人自定义项"
  ],
  [
    "Failed to clone Git repository",
    "克隆 Git 仓库失败"
  ],
  [
    "Failed to initialize workspace",
    "初始化工作区失败"
  ],
  [
    "Failed to start Best of N mode",
    "启动 Best of N 模式失败"
  ],
  [
    "Getting started with a Project",
    "开始使用项目"
  ],
  [
    "Mark all conversations as read",
    "将所有对话标记为已读"
  ],
  [
    "Terminal & Tooling Permissions",
    "终端与工具权限"
  ],
  [
    "always allow in this workspace",
    "在此工作区中永久允许"
  ],
  [
    "Always allow in this workspace",
    "在此工作区中永久允许"
  ],
  [
    "Implementation Plan (Approved)",
    "实施方案 (已批准)"
  ],
  [
    "Close window minimizes to tray",
    "关闭窗口时最小化到系统托盘"
  ],
  [
    "Deny all background executions",
    "拒绝所有后台无提示执行"
  ],
  [
    "Active Tasks & Conversations:",
    "活动任务与对话："
  ],
  [
    "Address CLs needing attention",
    "处理需要关注的代码变更 (CL)"
  ],
  [
    "Agent always asks for review.",
    "智能体始终请求审核。"
  ],
  [
    "Agent terminated due to error",
    "智能体因错误终止运行"
  ],
  [
    "Browser Actuation Permissions",
    "浏览器操作权限"
  ],
  [
    "Enable Sandbox Mode (Preview)",
    "启用沙箱模式 (预览版)"
  ],
  [
    "Enter Google Cloud Project ID",
    "输入 Google Cloud 项目 ID"
  ],
  [
    "Failed to delete conversation",
    "删除对话失败"
  ],
  [
    "Failed to rename conversation",
    "重命名对话失败"
  ],
  [
    "New Conversation in Workspace",
    "在工作区中新建对话"
  ],
  [
    "No matching commit hash found",
    "未找到匹配的提交哈希值"
  ],
  [
    "Open preview in embedded pane",
    "在内嵌窗格中打开预览"
  ],
  [
    "Run in your current workspace",
    "在当前工作区中运行"
  ],
  [
    "Sign in with business account",
    "使用企业账户登录"
  ],
  [
    "Split Conversation Vertically",
    "垂直拆分对话"
  ],
  [
    "Turn on a flag you don't have",
    "开启尚未拥有的实验性功能标记"
  ],
  [
    "Web (desktop, remote control)",
    "Web 端 (桌面远程控制)"
  ],
  [
    "when working in this project.",
    "（当在此项目中工作时）。"
  ],
  [
    "Workspace URI query parameter",
    "工作区 URI 查询参数"
  ],
  [
    "Restart now to apply changes?",
    "是否立即重启 Antigravity 以使新设置生效？"
  ],
  [
    "All changes since origin/main",
    "自远程主分支以来的所有更改"
  ],
  [
    "Allow List Terminal Commands",
    "终端命令允许列表"
  ],
  [
    "Antigravity Interactive HTML",
    "Antigravity 交互式 HTML 视图"
  ],
  [
    "Auto-Expand Changes Overview",
    "自动展开更改概览"
  ],
  [
    "Baseline model quota reached",
    "已达到基础模型配额上限"
  ],
  [
    "Changes in working directory",
    "工作区中的更改"
  ],
  [
    "Concierge voice mode stopped",
    "语音助理模式已停止"
  ],
  [
    "Connection lost, retrying...",
    "连接丢失，正在重试..."
  ],
  [
    "Create fork in new workspace",
    "在新工作区中创建分支"
  ],
  [
    "Download the Antigravity IDE",
    "下载 Antigravity IDE"
  ],
  [
    "Enter tool name or server...",
    "输入工具名称或服务器..."
  ],
  [
    "Failed to start conversation",
    "启动对话失败"
  ],
  [
    "GitHub Personal Access Token",
    "GitHub 个人访问令牌 (Token)"
  ],
  [
    "Manage application settings.",
    "管理应用设置。"
  ],
  [
    "Open in Trajectory Dashboard",
    "在轨迹仪表板中打开"
  ],
  [
    "Override feature environment",
    "覆盖特性运行环境"
  ],
  [
    "Previous match (Shift+Enter)",
    "上一个匹配项 (Shift+Enter)"
  ],
  [
    "Restart Main Language Server",
    "重启主语言服务器"
  ],
  [
    "Review pending conversations",
    "审核待处理对话"
  ],
  [
    "Select category to search...",
    "选择要搜索的分类..."
  ],
  [
    "Select Model to Send Message",
    "选择发送消息的模型"
  ],
  [
    "Select Previous Conversation",
    "选择上一个对话"
  ],
  [
    "Share Conversation (Preview)",
    "共享对话 (预览版)"
  ],
  [
    "Sidebar grouped by workspace",
    "侧边栏按工作区分组"
  ],
  [
    "Stage and commit all changes",
    "暂存并提交所有更改"
  ],
  [
    "Steps to reproduce the issue",
    "复现该问题的具体步骤"
  ],
  [
    "Web (mobile, remote control)",
    "Web 端 (移动远程控制)"
  ],
  [
    "Welcome to Cider with Jetski",
    "欢迎使用集成 Jetski 的 Cider"
  ],
  [
    "when working in this project",
    "（当在此项目中工作时）"
  ],
  [
    "Claude Sonnet 4.6 (Thinking)",
    "Claude Sonnet 4.6 (深度思考)"
  ],
  [
    "always allow in this project",
    "在此项目中永久允许"
  ],
  [
    "Always allow in this project",
    "在此项目中永久允许"
  ],
  [
    "Enable desktop notifications",
    "启用桌面悬浮通知"
  ],
  [
    "Settings saved successfully.",
    "设置已成功保存并立即生效。"
  ],
  [
    "This page is going away soon",
    "此页面即将下线"
  ],
  [
    "Enter avatar URL (optional)",
    "输入头像 URL（可选）"
  ],
  [
    "A new version is available.",
    "有新版本可用。"
  ],
  [
    "Add recent remote workspace",
    "添加最近的远程工作区"
  ],
  [
    "Allow running this command?",
    "允许执行此命令？"
  ],
  [
    "Alt+Enter Sends immediately",
    "Alt+Enter 立即发送"
  ],
  [
    "Automatic check for updates",
    "自动检查更新"
  ],
  [
    "Automatic Check for Updates",
    "自动检查软件更新"
  ],
  [
    "Browser settings have moved",
    "浏览器设置已迁移"
  ],
  [
    "Configure browser subagent.",
    "配置浏览器子智能体。"
  ],
  [
    "Configure Worktree Branches",
    "配置工作树分支"
  ],
  [
    "Confirm Browser Interaction",
    "确认浏览器交互"
  ],
  [
    "Deny List Terminal Commands",
    "终端命令拒绝列表"
  ],
  [
    "Enter Queues after the turn",
    "Enter 在本轮对话后排队"
  ],
  [
    "Explore the new Antigravity",
    "探索新版 Antigravity"
  ],
  [
    "Failed to archive workspace",
    "归档工作区失败"
  ],
  [
    "Failed to create workspace.",
    "创建工作区失败。"
  ],
  [
    "Failed to fork conversation",
    "分支对话失败"
  ],
  [
    "Failed to load conversation",
    "加载对话失败"
  ],
  [
    "Failed to stop conversation",
    "停止对话失败"
  ],
  [
    "Generate personalized rules",
    "生成个性化规则"
  ],
  [
    "Mark 1 conversation as read",
    "将 1 个对话标记为已读"
  ],
  [
    "New Conversation in Project",
    "在项目中新建对话"
  ],
  [
    "No Custom Agents or Plugins",
    "暂无自定义智能体或插件"
  ],
  [
    "Paths the agent can modify.",
    "智能体可以修改的路径。"
  ],
  [
    "Search for conversations...",
    "搜索对话..."
  ],
  [
    "Show Remote Control QR code",
    "显示远程控制二维码"
  ],
  [
    "Skills Configuration Error:",
    "技能配置错误:"
  ],
  [
    "Specialized suite of skills",
    "专业技能套件"
  ],
  [
    "Split Terminal Horizontally",
    "水平拆分终端"
  ],
  [
    "Toggle Environment Selector",
    "切换运行环境选择器"
  ],
  [
    "Unable to connect to server",
    "无法连接到语言服务器"
  ],
  [
    "Use regular expression (.*)",
    "使用正则表达式 (.*)"
  ],
  [
    "Implementation Plan (Draft)",
    "实施方案 (草稿)"
  ],
  [
    "Smooth out aggregate demand",
    "平滑分配全局服务算力需求"
  ],
  [
    "Browser User Data Directory",
    "浏览器缓存与用户数据目录"
  ],
  [
    "Duplicate this conversation",
    "创建此对话副本"
  ],
  [
    "duplicate this conversation",
    "创建此对话副本"
  ],
  [
    "Previous secondary pane tab",
    "上一个辅助窗格标签页"
  ],
  [
    "Download system diagnostics",
    "下载系统诊断日志"
  ],
  [
    "Click to open documentation",
    "点击查看文档"
  ],
  [
    "click to open documentation",
    "点击查看文档"
  ],
  [
    "Read, draft, and edit docs.",
    "读取、起草与编辑文档。"
  ],
  [
    "(Optional) Tell us more...",
    "（可选）告诉我们更多信息..."
  ],
  [
    "Browser tools (browser_.*)",
    "浏览器工具 (browser_.*)"
  ],
  [
    "Cannot revert this message",
    "无法撤回此消息"
  ],
  [
    "Click to copy full command",
    "点击复制完整命令"
  ],
  [
    "Copy conversation markdown",
    "复制对话为 Markdown"
  ],
  [
    "Copy full URL to clipboard",
    "复制完整 URL 到剪贴板"
  ],
  [
    "Core AI Systems is hiring!",
    "Core AI Systems 团队正在招聘！"
  ],
  [
    "Don't show this for 2 days",
    "2 天内不再显示"
  ],
  [
    "Failed to fetch turn diff:",
    "获取轮次差异失败:"
  ],
  [
    "Not suitable for Best-of-N",
    "不适合多候选对比 (Best-of-N)"
  ],
  [
    "Open with External Browser",
    "在外部浏览器中打开"
  ],
  [
    "Search MCP servers by name",
    "按名称搜索 MCP 服务器"
  ],
  [
    "Sidebar grouped by project",
    "侧边栏按项目分组"
  ],
  [
    "Time to First Token (TTFT)",
    "首 Token 延迟 (TTFT)"
  ],
  [
    "You have used some of your",
    "您已使用部分"
  ],
  [
    "Claude Opus 4.6 (Thinking)",
    "Claude Opus 4.6 (深度思考)"
  ],
  [
    "Allow using this MCP tool?",
    "允许使用此 MCP 工具？"
  ],
  [
    "Allow running this command",
    "允许执行此命令"
  ],
  [
    "Review Implementation Plan",
    "审阅实施方案"
  ],
  [
    "Review implementation plan",
    "审阅实施方案"
  ],
  [
    "Always allow safe commands",
    "始终自动允许安全白名单命令"
  ],
  [
    "Chrome Executable Location",
    "Chrome 浏览器主程序路径"
  ],
  [
    "Headless Browser Execution",
    "无头无界面后台模式 (Headless)"
  ],
  [
    "Copy conversation Markdown",
    "复制对话为 Markdown"
  ],
  [
    "Read, draft, and edit docs",
    "读取、起草与编辑文档"
  ],
  [
    "Enter bot name (optional)",
    "输入机器人名称（可选）"
  ],
  [
    "+ Add pull request policy",
    "+ 添加拉取请求策略"
  ],
  [
    "刷新 quota and credits data",
    "刷新额度和积分数据"
  ],
  [
    "Archive this conversation",
    "归档此对话"
  ],
  [
    "Browser User Profile Path",
    "浏览器用户配置文件目录路径"
  ],
  [
    "Build With Google Plugins",
    "Google 官方扩展插件"
  ],
  [
    "Enable AI Credit Overages",
    "允许超额使用 AI 点数"
  ],
  [
    "Error fetching MCP prompt",
    "获取 MCP 提示词错误"
  ],
  [
    "Extension (Visual Studio)",
    "扩展插件 (Visual Studio)"
  ],
  [
    "Failed to create terminal",
    "创建终端失败"
  ],
  [
    "Failed to create worktree",
    "创建工作树失败"
  ],
  [
    "Failed to delete worktree",
    "删除工作树失败"
  ],
  [
    "Failed to load some diffs",
    "加载部分差异对比失败"
  ],
  [
    "Open Conversation History",
    "打开对话历史记录"
  ],
  [
    "Open Folder (Interactive)",
    "打开文件夹 (交互式)"
  ],
  [
    "Other (write your answer)",
    "其他 (填写您的回答)"
  ],
  [
    "Paths the agent can read.",
    "智能体可以读取的路径。"
  ],
  [
    "Project validation failed",
    "项目验证失败"
  ],
  [
    "Project-Specific Settings",
    "项目专属设置"
  ],
  [
    "Refresh gcert credentials",
    "刷新 gcert 授权凭据"
  ],
  [
    "Run in a new git worktree",
    "在新的 Git 工作树中运行"
  ],
  [
    "Select Python Interpreter",
    "选择 Python 解释器"
  ],
  [
    "Split Terminal Vertically",
    "垂直拆分终端"
  ],
  [
    "Toggle Agent (Ctrl+Alt+B)",
    "切换智能体 (Ctrl+Alt+B)"
  ],
  [
    "Remote Debugging Required",
    "需要启用远程调试"
  ],
  [
    "Remote debugging required",
    "需要启用远程调试"
  ],
  [
    "Allow using this MCP tool",
    "允许使用此 MCP 工具"
  ],
  [
    "Yes, allow this time only",
    "是，仅允许本次"
  ],
  [
    "Send Anonymous Usage Data",
    "发送匿名使用数据以改进软件"
  ],
  [
    "Send anonymous usage data",
    "发送匿名使用数据以改进软件"
  ],
  [
    "Reload All Customizations",
    "重新加载全部自定义项"
  ],
  [
    "Execution Permission Mode",
    "命令执行权限确认模式"
  ],
  [
    "Restart Required to Apply",
    "需要重启软件方可完全生效"
  ],
  [
    "Ignore Whitespace Changes",
    "忽略空白字符更改"
  ],
  [
    "archive this conversation",
    "归档此对话"
  ],
  [
    "⌥⏎ Queues after the turn",
    "⌥⏎ 在本轮对话后排队"
  ],
  [
    "Any relevant information",
    "任何相关信息"
  ],
  [
    "Commands Outside Sandbox",
    "沙箱外执行的命令"
  ],
  [
    "Complete Onboarding Step",
    "完成引导步骤"
  ],
  [
    "Conversation unavailable",
    "对话不可用"
  ],
  [
    "Could not create project",
    "无法创建项目"
  ],
  [
    "Discard unstaged changes",
    "放弃未暂存的更改"
  ],
  [
    "Enable Shell Integration",
    "启用 Shell 集成功能"
  ],
  [
    "Fit the whole trajectory",
    "适配整条轨迹"
  ],
  [
    "Import AI Studio Project",
    "导入 AI Studio 项目"
  ],
  [
    "Include unstaged changes",
    "包含未暂存的更改"
  ],
  [
    "it will fully refresh in",
    "，将在"
  ],
  [
    "Launching the browser...",
    "正在启动浏览器..."
  ],
  [
    "MCP Configuration Error:",
    "MCP 配置错误:"
  ],
  [
    "No MCP servers installed",
    "未安装任何 MCP 服务器"
  ],
  [
    "No token data available.",
    "暂无 Token 用量数据。"
  ],
  [
    "Notification Preferences",
    "通知首选项"
  ],
  [
    "Open Conversation Picker",
    "打开对话选择器"
  ],
  [
    "Project name. E.g. Tasks",
    "项目名称，例如 Tasks"
  ],
  [
    "Search customizations...",
    "搜索自定义项..."
  ],
  [
    "Search past worktrees...",
    "搜索历史工作树..."
  ],
  [
    "Select Next Conversation",
    "选择下一个对话"
  ],
  [
    "Standalone Conversations",
    "独立对话"
  ],
  [
    "Updated sidebar grouping",
    "侧边栏分组已更新"
  ],
  [
    "view full search results",
    "查看完整搜索结果"
  ],
  [
    "Workspace Command Access",
    "工作区命令访问"
  ],
  [
    "Your Plan: Google AI Pro",
    "你的套餐：Google AI Pro"
  ],
  [
    "Show Editor Line Numbers",
    "显示代码行号"
  ],
  [
    "Thinking Intensity Level",
    "深度思考强度等级"
  ],
  [
    "Workspace Customizations",
    "当前工作区专属自定义项"
  ],
  [
    "Built-in Official Skills",
    "官方预装内置技能"
  ],
  [
    "Auto-execution Allowlist",
    "安全命令自动执行白名单"
  ],
  [
    "Manage Command Allowlist",
    "管理安全命令白名单"
  ],
  [
    "Add Command to Allowlist",
    "添加命令至白名单"
  ],
  [
    "Restore Factory Settings",
    "恢复出厂初始设置"
  ],
  [
    "Discard Settings Changes",
    "放弃当前修改"
  ],
  [
    "Rename this conversation",
    "重命名此对话"
  ],
  [
    "rename this conversation",
    "重命名此对话"
  ],
  [
    "Delete this conversation",
    "删除此对话"
  ],
  [
    "delete this conversation",
    "删除此对话"
  ],
  [
    "Toggle secondary sidebar",
    "切换辅助窗格"
  ],
  [
    "Open System Preferences",
    "打开系统设置"
  ],
  [
    "Marketplace Gallery URL",
    "插件市场列表 URL"
  ],
  [
    "⏎ Queues after the turn",
    "⏎ 在本轮对话后排队"
  ],
  [
    "Advanced Command Access",
    "高级命令访问"
  ],
  [
    "Back to Scheduled Tasks",
    "返回定时任务"
  ],
  [
    "Browser Actuation Rules",
    "浏览器自动化操作规则"
  ],
  [
    "Copy error to clipboard",
    "复制错误信息到剪贴板"
  ],
  [
    "Customize Global Skills",
    "自定义全局技能"
  ],
  [
    "Deny setting up browser",
    "拒绝配置浏览器"
  ],
  [
    "Edit Conversation Title",
    "编辑对话标题"
  ],
  [
    "Enable Demo Mode (Beta)",
    "启用演示模式 (测试版)"
  ],
  [
    "Enable Sounds for Agent",
    "启用智能体提示音效"
  ],
  [
    "Enable Terminal Sandbox",
    "启用终端沙箱隔离保护"
  ],
  [
    "Enter directory path...",
    "输入目录路径..."
  ],
  [
    "Enter Sends immediately",
    "Enter 立即发送"
  ],
  [
    "Enter workspace name...",
    "输入工作区名称..."
  ],
  [
    "Insufficient AI Credits",
    "AI 点数不足"
  ],
  [
    "Loading conversation...",
    "正在加载对话..."
  ],
  [
    "Open Keyboard Shortcuts",
    "打开快捷键设置"
  ],
  [
    "Open Workspace Selector",
    "打开工作区选择器"
  ],
  [
    "Personal Customizations",
    "个人自定义"
  ],
  [
    "Plugin Operation Error:",
    "插件操作错误:"
  ],
  [
    "Restart Language Server",
    "重启语言服务器"
  ],
  [
    "Search conversations...",
    "搜索对话..."
  ],
  [
    "Standalone Conversation",
    "独立对话"
  ],
  [
    "Toggle Project Selector",
    "切换项目选择器"
  ],
  [
    "Updates to your sidebar",
    "侧边栏更新"
  ],
  [
    "Models & Usage Settings",
    "模型与用量设置"
  ],
  [
    "Minimize to System Tray",
    "最小化至系统托盘"
  ],
  [
    "Telemetry & Diagnostics",
    "遥测与诊断报告"
  ],
  [
    "Quota Refresh Countdown",
    "限额完全刷新倒计时"
  ],
  [
    "Refresh Discovery Roots",
    "刷新自动发现目录"
  ],
  [
    "Prompt for confirmation",
    "执行前弹窗请求确认"
  ],
  [
    "Reset to Default Values",
    "恢复为初始默认值"
  ],
  [
    "Hide Whitespace Changes",
    "隐藏空白字符更改"
  ],
  [
    "Show Whitespace Changes",
    "显示空白字符更改"
  ],
  [
    "Unpin this conversation",
    "取消置顶此对话"
  ],
  [
    "unpin this conversation",
    "取消置顶此对话"
  ],
  [
    "Share this conversation",
    "共享此对话"
  ],
  [
    "share this conversation",
    "共享此对话"
  ],
  [
    "Next secondary pane tab",
    "下一个辅助窗格标签页"
  ],
  [
    "5-hour limit Remaining",
    "5小时剩余限额"
  ],
  [
    "ABFS Workspace (Alpha)",
    "ABFS 工作区 (Alpha)"
  ],
  [
    "Artifact Review Policy",
    "产物审核策略"
  ],
  [
    "Auto-Open Edited Files",
    "自动打开被编辑的文件"
  ],
  [
    "Background Task Output",
    "后台任务输出"
  ],
  [
    "Copy the trajectory ID",
    "复制轨迹 ID"
  ],
  [
    "Copy this subtree JSON",
    "复制此子树 JSON"
  ],
  [
    "Creating Cloud Project",
    "正在创建云端项目"
  ],
  [
    "Default Customizations",
    "默认自定义"
  ],
  [
    "Edit permission target",
    "编辑权限目标"
  ],
  [
    "Enter your feedback...",
    "输入您的反馈..."
  ],
  [
    "Evaluating thoughts...",
    "正在评估思考方案..."
  ],
  [
    "Files for Conversation",
    "本对话文件"
  ],
  [
    "Generating thoughts...",
    "正在梳理思考思路..."
  ],
  [
    "Go to General settings",
    "前往常规设置"
  ],
  [
    "Highlight After Accept",
    "接受后高亮显示改动"
  ],
  [
    "Move to Opposite Group",
    "移动到对侧分组"
  ],
  [
    "Move to Previous Group",
    "移动到上一分组"
  ],
  [
    "My Custom Gemini Model",
    "我的自定义 Gemini 模型"
  ],
  [
    "No artifacts generated",
    "未生成任何产物"
  ],
  [
    "No repositories found.",
    "未找到代码仓库。"
  ],
  [
    "Open in Remote Control",
    "在远程控制中打开"
  ],
  [
    "Open side-by-side view",
    "打开并排视图"
  ],
  [
    "Opening URL in Browser",
    "正在浏览器中打开 URL"
  ],
  [
    "quota and credits data",
    "额度和积分数据"
  ],
  [
    "Search across files...",
    "跨文件搜索..."
  ],
  [
    "Search for commands...",
    "搜索命令..."
  ],
  [
    "Show Selection Actions",
    "显示选中文本操作"
  ],
  [
    "This chat is archived.",
    "此对话已被归档。"
  ],
  [
    "Toggle Developer Tools",
    "切换开发者工具"
  ],
  [
    "Toggle Voice Recording",
    "切换语音录制"
  ],
  [
    "Use regular expression",
    "使用正则表达式"
  ],
  [
    "Waiting for user input",
    "等待用户输入"
  ],
  [
    "Weekly limit Remaining",
    "每周剩余限额"
  ],
  [
    "Allow using this tool?",
    "允许使用此工具？"
  ],
  [
    ", allow this time only",
    "，仅允许本次"
  ],
  [
    "Customization Settings",
    "自定义设置"
  ],
  [
    "Token Consumption Rate",
    "Token 消耗速率与统计"
  ],
  [
    "Fork this conversation",
    "创建此对话分支"
  ],
  [
    "fork this conversation",
    "创建此对话分支"
  ],
  [
    "Toggle voice recording",
    "切换语音录制"
  ],
  [
    "Toggle primary sidebar",
    "切换侧边栏"
  ],
  [
    "Show in File Explorer",
    "在文件资源管理器中显示"
  ],
  [
    "Pin this conversation",
    "置顶此对话"
  ],
  [
    "Toggle Overview Panel",
    "切换概览面板"
  ],
  [
    "Available AI Credits:",
    "可用 AI 积分："
  ],
  [
    "Allow in Conversation",
    "在本次对话中允许"
  ],
  [
    "At mention code block",
    "引用代码块"
  ],
  [
    "Auto-Execution Policy",
    "自动执行策略"
  ],
  [
    "Claude and GPT models",
    "Claude 和 GPT 模型"
  ],
  [
    "Commit staged changes",
    "提交已暂存更改"
  ],
  [
    "Complete verification",
    "完成验证"
  ],
  [
    "Confirm Window Reload",
    "确认重新加载窗口"
  ],
  [
    "Conversation Archived",
    "对话已归档"
  ],
  [
    "Copy config file path",
    "复制配置文件路径"
  ],
  [
    "Copy raw string value",
    "复制原始字符串值"
  ],
  [
    "Electron (Gemini App)",
    "Electron (Gemini 桌面版)"
  ],
  [
    "Enable Remote Control",
    "启用远程控制功能"
  ],
  [
    "Enter project name...",
    "输入项目名称..."
  ],
  [
    "Experimental features",
    "实验性功能"
  ],
  [
    "Experimental Features",
    "实验性功能"
  ],
  [
    "Extension (JetBrains)",
    "扩展插件 (JetBrains)"
  ],
  [
    "Failed to fetch diffs",
    "获取差异失败"
  ],
  [
    "Google3 Configuration",
    "Google3 配置"
  ],
  [
    "Installed MCP Servers",
    "已安装的 MCP 服务器"
  ],
  [
    "Match whole word (ab)",
    "匹配全词 (ab)"
  ],
  [
    "Model quota exhausted",
    "模型额度已耗尽"
  ],
  [
    "No environments found",
    "未找到环境"
  ],
  [
    "No folders added yet.",
    "尚未添加任何文件夹。"
  ],
  [
    "No previous worktrees",
    "暂无历史工作树"
  ],
  [
    "No remote configured.",
    "未配置远程仓库。"
  ],
  [
    "No repositories found",
    "未找到代码仓库"
  ],
  [
    "Notification settings",
    "通知设置"
  ],
  [
    "Notification Settings",
    "通知设置"
  ],
  [
    "Open in Notebook View",
    "在笔记本视图中打开"
  ],
  [
    "Open project settings",
    "打开项目设置"
  ],
  [
    "Opened URL in Browser",
    "已在浏览器中打开 URL"
  ],
  [
    "Previous Aux Pane Tab",
    "上一个辅助窗格标签页"
  ],
  [
    "Queues after the turn",
    "在本轮对话后排队"
  ],
  [
    "Regroup Google3 Chats",
    "重新聚合 Google3 聊天"
  ],
  [
    "Resize terminal panes",
    "调整终端窗格大小"
  ],
  [
    "Run in a new worktree",
    "在全新工作树中运行"
  ],
  [
    "Sandbox Allow Network",
    "沙箱允许网络访问"
  ],
  [
    "Select ABFS Workspace",
    "选择 ABFS 工作区"
  ],
  [
    "Select CitC Workspace",
    "选择 CitC 工作区"
  ],
  [
    "Select Default Branch",
    "选择默认分支"
  ],
  [
    "Start Voice Recording",
    "开始语音录制"
  ],
  [
    "Suggestions in Editor",
    "编辑器内的代码补全建议"
  ],
  [
    "Terminal: Add to Chat",
    "终端：添加到对话"
  ],
  [
    "Toggle Auxiliary Pane",
    "切换辅助窗格"
  ],
  [
    "Toggle Model Selector",
    "切换模型选择器"
  ],
  [
    "Trajectory Debug View",
    "轨迹调试视图"
  ],
  [
    "Verification required",
    "需要进行验证"
  ],
  [
    "will fully refresh in",
    "将在"
  ],
  [
    "Workspace File Access",
    "工作区文件访问"
  ],
  [
    "Allow using this tool",
    "允许使用此工具"
  ],
  [
    "Yes, and always allow",
    "是，且全局永久允许"
  ],
  [
    "Custom Skills & Rules",
    "自定义技能与规则"
  ],
  [
    "Global Customizations",
    "全局生效自定义项"
  ],
  [
    "Save Settings Changes",
    "保存设置更改"
  ],
  [
    "Amend previous commit",
    "修改上一次提交"
  ],
  [
    "pin this conversation",
    "置顶此对话"
  ],
  [
    "Toggle model selector",
    "切换模型选择器"
  ],
  [
    "Custom Context Menus",
    "自定义上下文菜单"
  ],
  [
    "Remote Control Issue",
    "远程控制问题"
  ],
  [
    "Marketplace Item URL",
    "插件市场详情 URL"
  ],
  [
    "Enter device name...",
    "输入设备名称..."
  ],
  [
    "active conversations",
    "个活动对话"
  ],
  [
    "[Dev] GCP Project ID",
    "[开发] GCP 项目 ID"
  ],
  [
    "⌥⏎ Sends immediately",
    "⌥⏎ 立即发送"
  ],
  [
    "打开 in current window",
    "在当前窗口打开"
  ],
  [
    "Advanced File Access",
    "高级文件访问"
  ],
  [
    "Agent Auto-Fix Lints",
    "智能体自动修复代码 Lint 错误"
  ],
  [
    "Archive conversation",
    "归档对话"
  ],
  [
    "Archive Conversation",
    "归档对话"
  ],
  [
    "Blocked, needs input",
    "已阻塞，需要输入"
  ],
  [
    "Build With Google 插件",
    "使用 Google 插件构建"
  ],
  [
    "Capture console logs",
    "捕获控制台日志"
  ],
  [
    "Collapse All Folders",
    "折叠所有文件夹"
  ],
  [
    "Command Setup Script",
    "命令初始配置脚本"
  ],
  [
    "Conversation History",
    "对话历史记录"
  ],
  [
    "Conversation Sharing",
    "对话分享"
  ],
  [
    "Copy section content",
    "复制小节内容"
  ],
  [
    "Create a JJ worktree",
    "创建 JJ 工作树"
  ],
  [
    "Creating terminal...",
    "正在创建终端..."
  ],
  [
    "Dismiss announcement",
    "忽略公告"
  ],
  [
    "Download Diagnostics",
    "下载系统诊断日志"
  ],
  [
    "Embedded web preview",
    "嵌入式网页预览"
  ],
  [
    "Enable Browser Tools",
    "启用浏览器工具"
  ],
  [
    "Enable Notifications",
    "启用通知"
  ],
  [
    "Enter URL pattern...",
    "输入 URL 匹配模式..."
  ],
  [
    "Enter workspace name",
    "输入工作区名称"
  ],
  [
    "Equalize Split Panes",
    "等分拆分窗格"
  ],
  [
    "Error Loading Models",
    "加载模型出错"
  ],
  [
    "Failed to load diff.",
    "加载差异失败。"
  ],
  [
    "Failed to stop agent",
    "停止智能体失败"
  ],
  [
    "Find in conversation",
    "在对话中查找"
  ],
  [
    "Loading worktrees...",
    "正在加载工作树..."
  ],
  [
    "Network Access Rules",
    "网络访问规则"
  ],
  [
    "No active terminals.",
    "无活动终端。"
  ],
  [
    "No changes to review",
    "暂无待审核的更改"
  ],
  [
    "No conversations yet",
    "暂无对话记录"
  ],
  [
    "No remote configured",
    "未配置远程仓库"
  ],
  [
    "Open a merge request",
    "创建合并请求 (Merge Request)"
  ],
  [
    "Open Agent on Reload",
    "重新加载时打开智能体"
  ],
  [
    "Open Command Palette",
    "打开命令面板"
  ],
  [
    "Open Editor Settings",
    "打开编辑器设置"
  ],
  [
    "Open in Preview Pane",
    "在预览窗格中打开"
  ],
  [
    "Pinned Conversations",
    "已置顶对话"
  ],
  [
    "Refresh skills paths",
    "刷新技能路径"
  ],
  [
    "Restore Conversation",
    "恢复对话"
  ],
  [
    "Search all convos...",
    "搜索全部对话..."
  ],
  [
    "Search workspaces...",
    "搜索工作区..."
  ],
  [
    "Select another model",
    "选择其他模型"
  ],
  [
    "Select Cog Workspace",
    "选择 Cog 工作区"
  ],
  [
    "Standalone Terminals",
    "独立终端"
  ],
  [
    "Stop Voice Recording",
    "停止语音录制"
  ],
  [
    "Streaming Generation",
    "流式生成"
  ],
  [
    "Tab Gitignore Access",
    "Tab 键访问 .gitignore 排除文件"
  ],
  [
    "Tool Call Generation",
    "工具调用生成耗时"
  ],
  [
    "Untracked (Unstaged)",
    "未跟踪 (未暂存)"
  ],
  [
    "View child subagents",
    "查看子智能体"
  ],
  [
    "Workspace Web Access",
    "工作区网络访问"
  ],
  [
    "Yes, allow this time",
    "是，仅允许本次"
  ],
  [
    "using this MCP tool?",
    "使用此 MCP 工具？"
  ],
  [
    "allow this time only",
    "仅允许本次"
  ],
  [
    "Allow this time only",
    "仅允许本次"
  ],
  [
    "Implementation Plans",
    "实施方案"
  ],
  [
    "User Review Required",
    "需要用户审阅"
  ],
  [
    "Terminal & Execution",
    "终端与执行策略"
  ],
  [
    "System Default Theme",
    "跟随操作系统默认"
  ],
  [
    "Interface Zoom Level",
    "界面整体缩放比例"
  ],
  [
    "Font Family Settings",
    "自定义字体系列"
  ],
  [
    "Compact Mode Display",
    "紧凑型布局排版"
  ],
  [
    "Choose Default Model",
    "选择默认主力模型"
  ],
  [
    "5-Hour Dynamic Limit",
    "5小时平滑动态限额"
  ],
  [
    "Follow the guide at",
    "按照以下指南进行操作："
  ],
  [
    "active conversation",
    "个活动对话"
  ],
  [
    "+ Add branch policy",
    "+ 添加分支策略"
  ],
  [
    "⏎ Sends immediately",
    "⏎ 立即发送"
  ],
  [
    "Advanced Web Access",
    "高级网页访问"
  ],
  [
    "Agent security mode",
    "智能体安全模式"
  ],
  [
    "CitC Workspace Type",
    "CitC 工作区类型"
  ],
  [
    "Configure the agent",
    "配置智能体"
  ],
  [
    "Conversation picker",
    "对话选择器"
  ],
  [
    "Copied to clipboard",
    "已复制到剪贴板"
  ],
  [
    "Debug Mode Disabled",
    "调试模式已禁用"
  ],
  [
    "Delete Conversation",
    "删除对话"
  ],
  [
    "Discard all changes",
    "放弃所有更改"
  ],
  [
    "Discard All Changes",
    "放弃所有更改"
  ],
  [
    "Enter avatar URL...",
    "输入头像 URL..."
  ],
  [
    "Extension (VS Code)",
    "扩展插件 (VS Code)"
  ],
  [
    "Get More AI Credits",
    "获取更多 AI 积分"
  ],
  [
    "Help improve Gemini",
    "帮助改进 Gemini"
  ],
  [
    "Installing Chat Bot",
    "正在安装聊天机器人"
  ],
  [
    "Loaded in workspace",
    "已在工作区中加载"
  ],
  [
    "Loading Antigravity",
    "正在加载 Antigravity"
  ],
  [
    "Model quota reached",
    "已达到模型配额上限"
  ],
  [
    "Modern Web Guidance",
    "现代 Web 开发指南"
  ],
  [
    "Network Permissions",
    "网络权限"
  ],
  [
    "No active terminals",
    "无活动终端"
  ],
  [
    "No background tasks",
    "无后台任务"
  ],
  [
    "No models available",
    "无可用模型"
  ],
  [
    "No Models Available",
    "无可用模型"
  ],
  [
    "Open a pull request",
    "创建拉取请求 (Pull Request)"
  ],
  [
    "Open in Code Search",
    "在代码搜索中打开"
  ],
  [
    "Open Project Picker",
    "打开项目选择器"
  ],
  [
    "Open System Browser",
    "在系统浏览器中打开"
  ],
  [
    "Other Conversations",
    "其他对话"
  ],
  [
    "Parent Conversation",
    "父级对话"
  ],
  [
    "Permission Settings",
    "权限设置"
  ],
  [
    "Pinned Conversation",
    "已固定对话"
  ],
  [
    "Refresh MCP servers",
    "刷新 MCP 服务器"
  ],
  [
    "Remote Control link",
    "远程控制链接"
  ],
  [
    "Select your license",
    "选择您的许可证"
  ],
  [
    "Side-by-side layout",
    "左右并排布局"
  ],
  [
    "Specifies the agent",
    "指定智能体"
  ],
  [
    "Trajectory Metadata",
    "轨迹元数据"
  ],
  [
    "Unstage all changes",
    "取消暂存所有更改"
  ],
  [
    "Unstage All Changes",
    "取消暂存所有更改"
  ],
  [
    "using this MCP tool",
    "使用此 MCP 工具"
  ],
  [
    "Implementation Plan",
    "实施方案"
  ],
  [
    "implementation plan",
    "实施方案"
  ],
  [
    "Implementation 套餐方案",
    "实施方案"
  ],
  [
    "Manual Verification",
    "人工验证"
  ],
  [
    "Appearance Settings",
    "外观设置"
  ],
  [
    "Browser Integration",
    "浏览器深度集成"
  ],
  [
    "Keep Computer Awake",
    "保持电脑处于唤醒状态"
  ],
  [
    "Keep computer awake",
    "保持电脑处于唤醒状态"
  ],
  [
    "Show in System Tray",
    "在系统托盘中常驻显示"
  ],
  [
    "Show in system tray",
    "在系统托盘中常驻显示"
  ],
  [
    "Sound Notifications",
    "播放提示音通知"
  ],
  [
    "Word Wrap in Editor",
    "代码编辑器自动折行"
  ],
  [
    "Uncommitted changes",
    "未提交更改"
  ],
  [
    "Uncommitted Changes",
    "未提交更改"
  ],
  [
    "Rename Conversation",
    "重命名对话"
  ],
  [
    "rename conversation",
    "重命名对话"
  ],
  [
    "Permanently delete",
    "永久删除"
  ],
  [
    "+ New Conversation",
    "+ 新建对话"
  ],
  [
    "Add inline comment",
    "添加行内批注"
  ],
  [
    "Add Scheduled Task",
    "添加定时任务"
  ],
  [
    "Agent Host Address",
    "智能体主机绑定地址"
  ],
  [
    "Alphabetical (A-Z)",
    "按字母顺序 (A-Z)"
  ],
  [
    "Analyzing Task Log",
    "正在分析任务日志"
  ],
  [
    "Any error messages",
    "任何错误信息"
  ],
  [
    "Available globally",
    "全局可用"
  ],
  [
    "Best of N Settings",
    "Best of N 设置"
  ],
  [
    "Capture screenshot",
    "捕获屏幕截图"
  ],
  [
    "Chrome Binary Path",
    "Chrome 浏览器可执行文件路径"
  ],
  [
    "CitC Workspace VCS",
    "CitC 工作区版本控制"
  ],
  [
    "Clear search (Esc)",
    "清除搜索 (Esc)"
  ],
  [
    "Close Terminal Tab",
    "关闭终端标签页"
  ],
  [
    "Commit all changes",
    "提交所有更改"
  ],
  [
    "Configure Branches",
    "配置分支"
  ],
  [
    "Conversation Width",
    "对话宽度"
  ],
  [
    "Copy email address",
    "复制邮箱地址"
  ],
  [
    "Copy trajectory ID",
    "复制轨迹 ID"
  ],
  [
    "Create New Project",
    "创建新项目"
  ],
  [
    "Creating a Project",
    "正在创建项目"
  ],
  [
    "Debug Mode Enabled",
    "调试模式已启用"
  ],
  [
    "Delete Permanently",
    "永久删除"
  ],
  [
    "Electron (Desktop)",
    "Electron (桌面客户端)"
  ],
  [
    "Enter file path...",
    "输入文件路径..."
  ],
  [
    "Enter project name",
    "输入项目名称"
  ],
  [
    "Enter tool name...",
    "输入工具名称..."
  ],
  [
    "Execution Metadata",
    "执行元数据"
  ],
  [
    "Expand All Folders",
    "展开所有文件夹"
  ],
  [
    "Failed to continue",
    "继续失败"
  ],
  [
    "Generator Metadata",
    "生成器元数据"
  ],
  [
    "Getting scripts...",
    "正在获取脚本..."
  ],
  [
    "GitHub Permissions",
    "GitHub 权限"
  ],
  [
    "Go Forward in Pane",
    "在窗格中前进"
  ],
  [
    "Group By Workspace",
    "按工作区分组"
  ],
  [
    "Insert in terminal",
    "插入到终端"
  ],
  [
    "Keyboard shortcuts",
    "键盘快捷键"
  ],
  [
    "Keyboard Shortcuts",
    "键盘快捷键"
  ],
  [
    "MCP Install Error:",
    "MCP 安装错误:"
  ],
  [
    "Move to New Window",
    "移动到新窗口"
  ],
  [
    "Move to Next Group",
    "移动到下一分组"
  ],
  [
    "New Scheduled Task",
    "新建定时任务"
  ],
  [
    "Next match (Enter)",
    "下一个匹配项 (Enter)"
  ],
  [
    "No answer provided",
    "未提供回答"
  ],
  [
    "No artifacts found",
    "未找到产物"
  ],
  [
    "No commits to push",
    "没有需要推送的提交"
  ],
  [
    "Open Browser Setup",
    "打开浏览器配置"
  ],
  [
    "Outside of Project",
    "项目外"
  ],
  [
    "Previous Worktrees",
    "历史工作树"
  ],
  [
    "Proceed in Sandbox",
    "在沙盒中继续"
  ],
  [
    "Restore split view",
    "恢复拆分视图"
  ],
  [
    "Saved successfully",
    "保存成功"
  ],
  [
    "Search projects...",
    "搜索项目..."
  ],
  [
    "Select Environment",
    "选择环境"
  ],
  [
    "Set Workspace Name",
    "设置工作区名称"
  ],
  [
    "Skill Custom Paths",
    "技能自定义路径"
  ],
  [
    "Sort Conversations",
    "排序对话"
  ],
  [
    "Steps to Reproduce",
    "复现步骤"
  ],
  [
    "Stop All Subagents",
    "停止所有子智能体"
  ],
  [
    "System Instruction",
    "系统指令"
  ],
  [
    "Toggle File Viewer",
    "切换文件查看器"
  ],
  [
    "Trajectory Metrics",
    "轨迹指标"
  ],
  [
    "Unpin Conversation",
    "取消置顶对话"
  ],
  [
    "Verbose agent chat",
    "详细智能体聊天"
  ],
  [
    "Verbose Agent Chat",
    "详细智能体对话日志"
  ],
  [
    "Workspace Settings",
    "工作区设置"
  ],
  [
    "(Thinking Process)",
    "(思考过程)"
  ],
  [
    ", and always allow",
    "，且全局永久允许"
  ],
  [
    "Security & Privacy",
    "安全与隐私"
  ],
  [
    "Terminal Font Size",
    "终端输出字体大小"
  ],
  [
    "Weekly Usage Limit",
    "每周全局使用限额"
  ],
  [
    "Add New MCP Server",
    "添加新 MCP 服务"
  ],
  [
    "Enabled by default",
    "默认处于启用状态"
  ],
  [
    "Whitespace Changes",
    "空白字符更改"
  ],
  [
    "unpin conversation",
    "取消置顶对话"
  ],
  [
    "Click to open docs",
    "点击查看文档"
  ],
  [
    "click to open docs",
    "点击查看文档"
  ],
  [
    "Setup Jetski Chat",
    "配置 Jetski 聊天"
  ],
  [
    "Advanced Settings",
    "高级设置"
  ],
  [
    "Copy Project Name",
    "复制项目名称"
  ],
  [
    "Edit project name",
    "编辑项目名称"
  ],
  [
    "Add to Chat/Quote",
    "添加至对话 / 引用"
  ],
  [
    "Advanced settings",
    "高级设置"
  ],
  [
    "Analyzed Task Log",
    "已分析任务日志"
  ],
  [
    "Archive / Restore",
    "归档 / 恢复"
  ],
  [
    "Archive Workspace",
    "归档工作区"
  ],
  [
    "Artifact Comments",
    "产物批注"
  ],
  [
    "Ask a question...",
    "提问..."
  ],
  [
    "Battle Mode Infos",
    "对战模式信息"
  ],
  [
    "Best-of-N Started",
    "多候选对比 (Best-of-N) 已启动"
  ],
  [
    "Check for Updates",
    "检查更新"
  ],
  [
    "Click to copy URL",
    "点击复制链接"
  ],
  [
    "Collapse thoughts",
    "收起思考过程"
  ],
  [
    "Continue Response",
    "继续生成回复"
  ],
  [
    "Conversation Name",
    "对话名称"
  ],
  [
    "Copy sign-in link",
    "复制登录链接"
  ],
  [
    "Copy to clipboard",
    "复制到剪贴板"
  ],
  [
    "Creating Chat Bot",
    "正在创建聊天机器人"
  ],
  [
    "Current workspace",
    "当前工作区"
  ],
  [
    "Current Workspace",
    "当前工作区"
  ],
  [
    "Delete MCP Server",
    "删除 MCP 服务器"
  ],
  [
    "Edit Custom Model",
    "编辑自定义模型"
  ],
  [
    "Enter bot name...",
    "输入机器人名称..."
  ],
  [
    "Expected behavior",
    "预期行为"
  ],
  [
    "Extension (Cider)",
    "扩展插件 (Cider)"
  ],
  [
    "Failed to proceed",
    "继续执行失败"
  ],
  [
    "File Access Rules",
    "文件访问规则"
  ],
  [
    "Fork Conversation",
    "分支对话"
  ],
  [
    "Google (internal)",
    "Google (内部版)"
  ],
  [
    "Loaded in Google3",
    "已在 Google3 中加载"
  ],
  [
    "Local permissions",
    "本地权限"
  ],
  [
    "Local Permissions",
    "本地权限"
  ],
  [
    "New Editor Window",
    "新建编辑器窗口"
  ],
  [
    "Next Aux Pane Tab",
    "下一个辅助窗格标签页"
  ],
  [
    "No agents running",
    "没有正在运行的代理"
  ],
  [
    "No matching flags",
    "无匹配的标志"
  ],
  [
    "No Model Selected",
    "未选择模型"
  ],
  [
    "No projects found",
    "未找到项目"
  ],
  [
    "Open Commit Graph",
    "打开提交记录图"
  ],
  [
    "Open Conversation",
    "打开对话"
  ],
  [
    "Permission Preset",
    "权限预设模式"
  ],
  [
    "Previous Pane Tab",
    "上一个窗格标签页"
  ],
  [
    "Proceed with Plan",
    "按计划执行"
  ],
  [
    "Prompt too simple",
    "提示词过短或过于简单"
  ],
  [
    "Record voice memo",
    "录制语音备忘"
  ],
  [
    "Remove from Group",
    "从分组中移除"
  ],
  [
    "Remove From Split",
    "从拆分中移除"
  ],
  [
    "Root Conversation",
    "根级对话"
  ],
  [
    "Run (unsandboxed)",
    "运行 (无沙箱隔离)"
  ],
  [
    "Search metrics...",
    "搜索指标..."
  ],
  [
    "Selection Actions",
    "选中操作浮条"
  ],
  [
    "Sends immediately",
    "立即发送"
  ],
  [
    "Show more results",
    "显示更多结果"
  ],
  [
    "Sort Conversation",
    "排序对话"
  ],
  [
    "Stage all changes",
    "暂存所有更改"
  ],
  [
    "Stage All Changes",
    "暂存所有更改"
  ],
  [
    "Terminal Commands",
    "终端命令"
  ],
  [
    "Toggle Fullscreen",
    "切换全屏模式"
  ],
  [
    "Type a message...",
    "输入消息或指令..."
  ],
  [
    "View Stacked Diff",
    "上下差异对比"
  ],
  [
    "Verification Plan",
    "验证方案"
  ],
  [
    "Run in Background",
    "在后台保持静默运行"
  ],
  [
    "Run in background",
    "在后台保持静默运行"
  ],
  [
    "Launch on Startup",
    "开机时自动启动"
  ],
  [
    "Launch on startup",
    "开机时自动启动"
  ],
  [
    "Show Code Minimap",
    "显示代码缩略图"
  ],
  [
    "Ignore Whitespace",
    "忽略空白字符"
  ],
  [
    "All changes since",
    "所有更改自"
  ],
  [
    "Reopen Closed Tab",
    "重新打开关闭的标签页"
  ],
  [
    "Reopen closed tab",
    "重新打开关闭的标签页"
  ],
  [
    "Build with Google",
    "基于 Google 技术构建"
  ],
  [
    "Project Settings",
    "项目设置"
  ],
  [
    "Pin conversation",
    "置顶对话"
  ],
  [
    "to be installed.",
    "才能使用。"
  ],
  [
    "打开 浏览器 (Preview)",
    "打开浏览器 (预览)"
  ],
  [
    "打开 in workspace:",
    "在工作区打开："
  ],
  [
    "Add Custom Model",
    "添加自定义模型"
  ],
  [
    "Auth and Billing",
    "身份验证与账单"
  ],
  [
    "Background Tasks",
    "后台任务"
  ],
  [
    "Best of N Models",
    "Best of N 模型"
  ],
  [
    "Browser CDP Port",
    "浏览器 CDP 调试端口"
  ],
  [
    "Browser Settings",
    "浏览器设置"
  ],
  [
    "Cancel All Tasks",
    "取消所有任务"
  ],
  [
    "Cancel recording",
    "取消录音"
  ],
  [
    "Commit succeeded",
    "提交成功"
  ],
  [
    "Copy description",
    "复制描述"
  ],
  [
    "Copy schema JSON",
    "复制 Schema JSON"
  ],
  [
    "Create a Project",
    "创建项目"
  ],
  [
    "Creating Sidecar",
    "正在创建 Sidecar"
  ],
  [
    "Debug (Disabled)",
    "调试模式 (已禁用)"
  ],
  [
    "Enable Telemetry",
    "启用匿名使用情况遥测"
  ],
  [
    "Enter command...",
    "输入命令..."
  ],
  [
    "Failed to Commit",
    "提交失败"
  ],
  [
    "File Permissions",
    "文件权限"
  ],
  [
    "fully refresh in",
    "刷新时间："
  ],
  [
    "General Feedback",
    "一般反馈"
  ],
  [
    "Generation Steps",
    "生成步骤"
  ],
  [
    "Group By Project",
    "按项目分组"
  ],
  [
    "Host Environment",
    "主机运行环境"
  ],
  [
    "Inspected commit",
    "已检查提交"
  ],
  [
    "Installed Skills",
    "已安装技能"
  ],
  [
    "Keep In Menu Bar",
    "在菜单栏/托盘中常驻"
  ],
  [
    "Learn more about",
    "了解关于"
  ],
  [
    "Manifest Changes",
    "清单文件更改"
  ],
  [
    "Mark all as read",
    "全部标记为已读"
  ],
  [
    "Marketing Emails",
    "营销推广邮件"
  ],
  [
    "Match whole word",
    "匹配全词"
  ],
  [
    "New Agent Script",
    "新建智能体脚本"
  ],
  [
    "New conversation",
    "新建对话"
  ],
  [
    "New Conversation",
    "新建对话"
  ],
  [
    "New Terminal Tab",
    "新建终端标签页"
  ],
  [
    "No browser pages",
    "无浏览器页面"
  ],
  [
    "No conversations",
    "暂无对话"
  ],
  [
    "No Custom Agents",
    "无自定义智能体"
  ],
  [
    "No file changes.",
    "无文件更改。"
  ],
  [
    "No results found",
    "未找到结果"
  ],
  [
    "Open File Search",
    "打开文件搜索"
  ],
  [
    "Open Preferences",
    "打开偏好设置"
  ],
  [
    "Operating System",
    "操作系统"
  ],
  [
    "Pin Conversation",
    "置顶对话"
  ],
  [
    "Project Detected",
    "检测到项目"
  ],
  [
    "Provide feedback",
    "提供反馈"
  ],
  [
    "Provide Feedback",
    "提供反馈"
  ],
  [
    "Purchase Credits",
    "购买点数配额"
  ],
  [
    "Replace With New",
    "替换为新建"
  ],
  [
    "Reset to Default",
    "重置为默认值"
  ],
  [
    "Restore Defaults",
    "恢复默认设置"
  ],
  [
    "Screen Recording",
    "屏幕录制"
  ],
  [
    "Select Folder(s)",
    "选择文件夹"
  ],
  [
    "Select Workspace",
    "选择工作区"
  ],
  [
    "Send feedback as",
    "反馈提交身份"
  ],
  [
    "Send Immediately",
    "立即发送"
  ],
  [
    "Set Project Name",
    "设置项目名称"
  ],
  [
    "Terms of Service",
    "服务条款"
  ],
  [
    "Thinking Process",
    "思考过程"
  ],
  [
    "Too many surveys",
    "问卷调查过于频繁"
  ],
  [
    "Tool Permissions",
    "工具使用权限"
  ],
  [
    "Unstaged Changes",
    "未暂存的更改"
  ],
  [
    "Update Available",
    "发现可用更新"
  ],
  [
    "Configure Models",
    "配置模型"
  ],
  [
    "using this tool?",
    "使用此工具？"
  ],
  [
    "and always allow",
    "且全局永久允许"
  ],
  [
    "Proposed Changes",
    "拟议更改"
  ],
  [
    "General Settings",
    "常规设置"
  ],
  [
    "Minimize to tray",
    "最小化至系统托盘"
  ],
  [
    "Light Mode Theme",
    "浅色模式主题"
  ],
  [
    "Reset Zoom Level",
    "重置界面缩放"
  ],
  [
    "Editor Font Size",
    "代码编辑器字号"
  ],
  [
    "Default AI Model",
    "默认 AI 模型"
  ],
  [
    "Add Custom Skill",
    "添加新技能插件"
  ],
  [
    "Disabled by user",
    "已被用户手动禁用"
  ],
  [
    "Delete Workspace",
    "删除工作区"
  ],
  [
    "Failed to commit",
    "提交失败"
  ],
  [
    "pin conversation",
    "置顶对话"
  ],
  [
    "New terminal tab",
    "新建终端标签页"
  ],
  [
    "Google Workspace",
    "Google 工作区"
  ],
  [
    "For help, visit",
    "如需帮助，请访问"
  ],
  [
    "Remove resource",
    "移除资源"
  ],
  [
    "to be installed",
    "才能使用"
  ],
  [
    "5小时限额 Remaining",
    "5小时剩余限额"
  ],
  [
    "Action required",
    "需要操作"
  ],
  [
    "Actual behavior",
    "实际行为"
  ],
  [
    "Add MCP Servers",
    "添加 MCP 服务器"
  ],
  [
    "Archive project",
    "归档项目"
  ],
  [
    "Ask anything...",
    "提出任何问题..."
  ],
  [
    "Auto (detected)",
    "自动 (已检测)"
  ],
  [
    "Background Task",
    "后台任务"
  ],
  [
    "Best-of-N Ended",
    "多候选对比 (Best-of-N) 已结束"
  ],
  [
    "Checkout Branch",
    "检出分支"
  ],
  [
    "Command Palette",
    "命令面板"
  ],
  [
    "Conversation ID",
    "对话 ID"
  ],
  [
    "Copy debug info",
    "复制调试信息"
  ],
  [
    "Debug (Enabled)",
    "调试模式 (已启用)"
  ],
  [
    "Delete Terminal",
    "删除终端"
  ],
  [
    "Discard changes",
    "放弃更改"
  ],
  [
    "Discard Changes",
    "放弃更改"
  ],
  [
    "Display Options",
    "显示选项"
  ],
  [
    "Edit task title",
    "编辑任务标题"
  ],
  [
    "Editor Settings",
    "编辑器设置"
  ],
  [
    "Enable Overages",
    "允许超出限额"
  ],
  [
    "Enter target...",
    "输入目标..."
  ],
  [
    "Expand thoughts",
    "展开思考过程"
  ],
  [
    "Feature Request",
    "功能请求"
  ],
  [
    "Five Hour Limit",
    "5小时限额"
  ],
  [
    "GitHub Policies",
    "GitHub 策略"
  ],
  [
    "global settings",
    "全局设置"
  ],
  [
    "Go Back in Pane",
    "在窗格中返回"
  ],
  [
    "Import success:",
    "导入成功："
  ],
  [
    "Inherit General",
    "继承常规设置"
  ],
  [
    "Layout Controls",
    "布局控制"
  ],
  [
    "Match case (Aa)",
    "区分大小写 (Aa)"
  ],
  [
    "Message history",
    "消息历史"
  ],
  [
    "Message History",
    "消息历史"
  ],
  [
    "Missing Folders",
    "缺失文件夹"
  ],
  [
    "No file changes",
    "无文件更改"
  ],
  [
    "Not on a branch",
    "不在任何分支上"
  ],
  [
    "Open in new tab",
    "在新标签页中打开"
  ],
  [
    "Paste auth code",
    "粘贴授权码"
  ],
  [
    "Paste code here",
    "在此粘贴代码"
  ],
  [
    "Project Folders",
    "项目文件夹"
  ],
  [
    "Project General",
    "项目常规"
  ],
  [
    "Project options",
    "项目选项"
  ],
  [
    "Queued Messages",
    "排队中的消息"
  ],
  [
    "Quote Selection",
    "引用选中文本"
  ],
  [
    "Remote branches",
    "远程分支"
  ],
  [
    "Scheduled Tasks",
    "计划任务"
  ],
  [
    "Search files...",
    "搜索文件..."
  ],
  [
    "Search steps...",
    "搜索步骤..."
  ],
  [
    "Search tasks...",
    "搜索任务..."
  ],
  [
    "Security Preset",
    "安全策略预设"
  ],
  [
    "Segment Metrics",
    "分段指标"
  ],
  [
    "Select Worktree",
    "选择工作树"
  ],
  [
    "Thought Process",
    "思考过程"
  ],
  [
    "Toggle Terminal",
    "切换终端面板"
  ],
  [
    "Unstage changes",
    "取消暂存更改"
  ],
  [
    "Unstage Changes",
    "取消暂存所有更改"
  ],
  [
    "View Debug Info",
    "查看调试信息"
  ],
  [
    "View Split Diff",
    "分栏差异对比"
  ],
  [
    "Thinking Budget",
    "思考预算"
  ],
  [
    "Thinking Effort",
    "思考强度"
  ],
  [
    "Thinking budget",
    "思考预算"
  ],
  [
    "Thinking effort",
    "思考强度"
  ],
  [
    "Continue Anyway",
    "仍然继续"
  ],
  [
    "Continue anyway",
    "仍然继续"
  ],
  [
    "using this tool",
    "使用此工具"
  ],
  [
    "Automated Tests",
    "自动化测试"
  ],
  [
    "Theme Selection",
    "主题外观选择"
  ],
  [
    "Dark Mode Theme",
    "深色模式主题"
  ],
  [
    "Add Custom Rule",
    "添加自定义规则"
  ],
  [
    "Hide Whitespace",
    "隐藏空白字符"
  ],
  [
    "Show Whitespace",
    "显示空白字符"
  ],
  [
    "Failed to amend",
    "修改上次提交失败"
  ],
  [
    "Failed to Amend",
    "修改上次提交失败"
  ],
  [
    "Commit and Push",
    "提交并推送"
  ],
  [
    "Show breakdowns",
    "查看明细"
  ],
  [
    "show breakdowns",
    "查看明细"
  ],
  [
    "Hide breakdowns",
    "隐藏明细"
  ],
  [
    "hide breakdowns",
    "隐藏明细"
  ],
  [
    "Google Calendar",
    "Google 日历"
  ],
  [
    "Chrome DevTools",
    "Chrome 开发者工具"
  ],
  [
    "Custom Agents 0",
    "自定义智能体 0"
  ],
  [
    "Delete Project",
    "删除项目"
  ],
  [
    "Inherit Global",
    "继承全局"
  ],
  [
    "Overview Panel",
    "概览面板"
  ],
  [
    "每周限额 Remaining",
    "每周剩余限额"
  ],
  [
    "Add MCP server",
    "添加 MCP 服务器"
  ],
  [
    "Add MCP Server",
    "添加 MCP 服务器"
  ],
  [
    "Added (Staged)",
    "已添加 (已暂存)"
  ],
  [
    "Agent Behavior",
    "智能体行为"
  ],
  [
    "Agent response",
    "智能体回复"
  ],
  [
    "Agent Settings",
    "智能体设置"
  ],
  [
    "All Workspaces",
    "所有工作区"
  ],
  [
    "Always Proceed",
    "始终继续"
  ],
  [
    "Android (main)",
    "Android (主分支)"
  ],
  [
    "Ask every time",
    "每次均询问"
  ],
  [
    "Auto Execution",
    "自动执行"
  ],
  [
    "Branch Changes",
    "分支更改"
  ],
  [
    "Cascade Config",
    "级联配置"
  ],
  [
    "CitC Workspace",
    "CitC 工作区"
  ],
  [
    "Close Settings",
    "关闭设置"
  ],
  [
    "Collapse Diffs",
    "折叠所有差异"
  ],
  [
    "Command Center",
    "命令中心"
  ],
  [
    "Commit Message",
    "提交说明"
  ],
  [
    "Copy File Name",
    "复制文件名"
  ],
  [
    "Copy File Path",
    "复制文件路径"
  ],
  [
    "Create project",
    "创建项目"
  ],
  [
    "Create Project",
    "创建项目"
  ],
  [
    "Customizations",
    "自定义"
  ],
  [
    "Delete comment",
    "删除批注"
  ],
  [
    "Delete Handler",
    "删除处理器"
  ],
  [
    "Failed to Push",
    "推送失败"
  ],
  [
    "Go to Projects",
    "前往项目"
  ],
  [
    "Import failed:",
    "导入失败："
  ],
  [
    "Inline Actions",
    "行内快捷操作"
  ],
  [
    "Input required",
    "需要用户输入"
  ],
  [
    "Mark as unread",
    "标记为未读"
  ],
  [
    "Mark as Unread",
    "标记为未读"
  ],
  [
    "Mark As Unread",
    "标记为未读"
  ],
  [
    "Missing Folder",
    "缺失文件夹"
  ],
  [
    "Models & Usage",
    "模型与用量"
  ],
  [
    "No build files",
    "无构建文件"
  ],
  [
    "No MCP Servers",
    "无 MCP 服务器"
  ],
  [
    "No tasks found",
    "未找到任务"
  ],
  [
    "Not in Project",
    "未在项目中"
  ],
  [
    "Open Launchpad",
    "打开启动面板"
  ],
  [
    "Open Workspace",
    "打开工作区"
  ],
  [
    "Opened browser",
    "已打开浏览器"
  ],
  [
    "Please wait...",
    "请稍候..."
  ],
  [
    "Plugin details",
    "插件详情"
  ],
  [
    "Previous match",
    "上一个匹配项"
  ],
  [
    "Proceeded with",
    "已执行"
  ],
  [
    "Project picker",
    "项目选择器"
  ],
  [
    "Push succeeded",
    "推送成功"
  ],
  [
    "Remote Control",
    "远程控制"
  ],
  [
    "Request Review",
    "请求审核"
  ],
  [
    "Require Review",
    "需要审核"
  ],
  [
    "Revert changes",
    "撤销更改"
  ],
  [
    "Review Changes",
    "审核代码更改"
  ],
  [
    "Select Folders",
    "选择文件夹"
  ],
  [
    "Select License",
    "选择许可证"
  ],
  [
    "Select Project",
    "选择项目"
  ],
  [
    "Split Terminal",
    "拆分终端"
  ],
  [
    "Stacked layout",
    "上下堆叠布局"
  ],
  [
    "Staged changes",
    "已暂存更改"
  ],
  [
    "Staged Changes",
    "已暂存的更改"
  ],
  [
    "Start Snapshot",
    "起始快照"
  ],
  [
    "Stop execution",
    "停止执行"
  ],
  [
    "Toggle Sidebar",
    "切换侧边栏"
  ],
  [
    "Tool Execution",
    "工具执行耗时"
  ],
  [
    "Type a message",
    "输入消息"
  ],
  [
    "Typeahead menu",
    "自动补全菜单"
  ],
  [
    "Unstage change",
    "取消暂存更改"
  ],
  [
    "View Installed",
    "查看已安装项"
  ],
  [
    "Workspace Name",
    "工作区名称"
  ],
  [
    "using this MCP",
    "使用此 MCP"
  ],
  [
    "Open Questions",
    "待定问题"
  ],
  [
    "Failed to push",
    "推送失败"
  ],
  [
    "Failed to pull",
    "拉取失败"
  ],
  [
    "Split terminal",
    "拆分终端"
  ],
  [
    "Show breakdown",
    "查看明细"
  ],
  [
    "show breakdown",
    "查看明细"
  ],
  [
    "Hide breakdown",
    "隐藏明细"
  ],
  [
    "hide breakdown",
    "隐藏明细"
  ],
  [
    "Delete plugin",
    "删除插件"
  ],
  [
    "Context Menus",
    "上下文菜单"
  ],
  [
    "Access grants",
    "访问授权"
  ],
  [
    "Add Hook Card",
    "添加钩子卡片"
  ],
  [
    "Add Workspace",
    "添加工作区"
  ],
  [
    "Agent Decides",
    "由智能体决定"
  ],
  [
    "All tools (*)",
    "所有工具 (*)"
  ],
  [
    "Allow options",
    "允许选项"
  ],
  [
    "Also includes",
    "同时包含"
  ],
  [
    "Apply changes",
    "应用更改"
  ],
  [
    "Apply Changes",
    "应用更改"
  ],
  [
    "Artifact Name",
    "产物名称"
  ],
  [
    "Chat Settings",
    "聊天设置"
  ],
  [
    "CitC Settings",
    "CitC 设置"
  ],
  [
    "Clear History",
    "清除历史记录"
  ],
  [
    "Close Sidebar",
    "关闭侧边栏"
  ],
  [
    "Cog Workspace",
    "Cog 工作区"
  ],
  [
    "Conversations",
    "对话列表"
  ],
  [
    "Copy thinking",
    "复制思考过程"
  ],
  [
    "Custom Agents",
    "自定义智能体"
  ],
  [
    "Default Light",
    "默认浅色"
  ],
  [
    "Excluded Step",
    "已排除步骤"
  ],
  [
    "Feedback Type",
    "反馈类型"
  ],
  [
    "File Explorer",
    "文件资源管理器"
  ],
  [
    "Files Changed",
    "已更改文件"
  ],
  [
    "Good response",
    "回答准确 (好评)"
  ],
  [
    "Group Actions",
    "分组操作"
  ],
  [
    "Hide thoughts",
    "收起思考过程"
  ],
  [
    "Inherits from",
    "继承自"
  ],
  [
    "Inline Widget",
    "行内小组件"
  ],
  [
    "Invalid Media",
    "无效媒体文件"
  ],
  [
    "Manage Skills",
    "管理技能"
  ],
  [
    "Message input",
    "消息输入框"
  ],
  [
    "Model & Usage",
    "模型与用量"
  ],
  [
    "Model Credits",
    "模型点数"
  ],
  [
    "Move to Group",
    "移动到分组"
  ],
  [
    "New hook name",
    "新钩子名称"
  ],
  [
    "New Workspace",
    "新建工作区"
  ],
  [
    "Next Pane Tab",
    "下一个窗格标签页"
  ],
  [
    "No Compaction",
    "无压缩"
  ],
  [
    "No groups yet",
    "暂无分组"
  ],
  [
    "No subagents.",
    "无子智能体。"
  ],
  [
    "No trajectory",
    "无轨迹记录"
  ],
  [
    "Not Signed In",
    "未登录"
  ],
  [
    "Notifications",
    "通知"
  ],
  [
    "Open Settings",
    "打开设置"
  ],
  [
    "Planning Mode",
    "规划模式"
  ],
  [
    "Prevent Sleep",
    "阻止系统休眠"
  ],
  [
    "Project Agent",
    "项目智能体"
  ],
  [
    "Review Policy",
    "审核策略"
  ],
  [
    "Select branch",
    "选择分支"
  ],
  [
    "Select Folder",
    "选择文件夹"
  ],
  [
    "Send Feedback",
    "提交反馈"
  ],
  [
    "Show thoughts",
    "展开思考过程"
  ],
  [
    "Stage changes",
    "暂存更改"
  ],
  [
    "Stage Changes",
    "暂存所有更改"
  ],
  [
    "Stop subagent",
    "停止子智能体"
  ],
  [
    "Stop Subagent",
    "停止子智能体"
  ],
  [
    "System Prompt",
    "系统提示词"
  ],
  [
    "Tab to Import",
    "按 Tab 键快速导入"
  ],
  [
    "Table options",
    "表格选项"
  ],
  [
    "Toggle Editor",
    "切换编辑器"
  ],
  [
    "Trajectory ID",
    "轨迹 ID"
  ],
  [
    "UI extensions",
    "UI 扩展"
  ],
  [
    "UI Extensions",
    "UI 扩展"
  ],
  [
    "United States",
    "美国"
  ],
  [
    "Vetted (beta)",
    "官方认证 (测试版)"
  ],
  [
    "Web (desktop)",
    "Web (桌面端网页)"
  ],
  [
    "Welcome back!",
    "欢迎回来！"
  ],
  [
    "Worktree Name",
    "工作树名称"
  ],
  [
    "Manage Models",
    "管理模型"
  ],
  [
    "Restart Later",
    "稍后手动重启"
  ],
  [
    "Inherits your",
    "继承您的"
  ],
  [
    "Branch master",
    "主分支 (master)"
  ],
  [
    "branch master",
    "主分支 (master)"
  ],
  [
    "origin/master",
    "远程主分支"
  ],
  [
    "Open Terminal",
    "打开终端"
  ],
  [
    "Commit & Push",
    "提交并推送"
  ],
  [
    "Open settings",
    "打开设置"
  ],
  [
    "Duplicate Tab",
    "复制标签页"
  ],
  [
    "Duplicate tab",
    "复制标签页"
  ],
  [
    "Google Sheets",
    "Google 表格"
  ],
  [
    "Google Slides",
    "Google 幻灯片"
  ],
  [
    "Full machine",
    "整机访问"
  ],
  [
    "More options",
    "更多选项"
  ],
  [
    "5-hour limit",
    "5小时限额"
  ],
  [
    "打开 window...",
    "打开窗口..."
  ],
  [
    "Add Terminal",
    "添加终端"
  ],
  [
    "Agent Script",
    "智能体脚本"
  ],
  [
    "Always Allow",
    "始终允许"
  ],
  [
    "Amend Commit",
    "修改上次提交"
  ],
  [
    "Analyzing...",
    "正在分析中..."
  ],
  [
    "App Settings",
    "应用设置"
  ],
  [
    "Bad response",
    "回答不佳 (差评)"
  ],
  [
    "Browser Task",
    "浏览器任务"
  ],
  [
    "By step type",
    "按步骤类型"
  ],
  [
    "Clear search",
    "清除搜索"
  ],
  [
    "Close Folder",
    "关闭文件夹"
  ],
  [
    "Close Window",
    "关闭窗口"
  ],
  [
    "Collapse All",
    "全部折叠"
  ],
  [
    "Commit Graph",
    "提交历史图谱"
  ],
  [
    "Confirm Quit",
    "确认退出"
  ],
  [
    "Confirm Undo",
    "确认撤销"
  ],
  [
    "Console logs",
    "控制台日志"
  ],
  [
    "Conversation",
    "对话"
  ],
  [
    "Copy Command",
    "复制命令"
  ],
  [
    "Copy Content",
    "复制内容"
  ],
  [
    "Create Group",
    "创建分组"
  ],
  [
    "Default Dark",
    "默认深色"
  ],
  [
    "Deselect all",
    "取消全选"
  ],
  [
    "Deselect All",
    "取消全选"
  ],
  [
    "Disable Task",
    "禁用任务"
  ],
  [
    "Edit comment",
    "编辑批注"
  ],
  [
    "End Snapshot",
    "结束快照"
  ],
  [
    "Execute URLs",
    "执行 URL"
  ],
  [
    "Executing...",
    "正在执行中..."
  ],
  [
    "Execution ID",
    "执行 ID"
  ],
  [
    "Expand Diffs",
    "展开所有差异"
  ],
  [
    "Find in Pane",
    "在窗格中查找"
  ],
  [
    "Google Drive",
    "Google 云端硬盘"
  ],
  [
    "Last Updated",
    "最近更新"
  ],
  [
    "Manage Hooks",
    "管理钩子"
  ],
  [
    "Mark as read",
    "标记为已读"
  ],
  [
    "Mark as Read",
    "标记为已读"
  ],
  [
    "Mark As Read",
    "标记为已读"
  ],
  [
    "Mention Page",
    "提及页面"
  ],
  [
    "Merge Branch",
    "合并分支"
  ],
  [
    "More actions",
    "更多操作"
  ],
  [
    "More Actions",
    "更多操作"
  ],
  [
    "New Terminal",
    "新建终端"
  ],
  [
    "New worktree",
    "新建工作树"
  ],
  [
    "New Worktree",
    "新建工作树"
  ],
  [
    "No subagents",
    "无子智能体"
  ],
  [
    "Notification",
    "通知"
  ],
  [
    "Open Preview",
    "打开预览"
  ],
  [
    "Project Name",
    "项目名称"
  ],
  [
    "Recent Files",
    "最近打开的文件"
  ],
  [
    "Record Audio",
    "录制音频"
  ],
  [
    "Rename Group",
    "重命名分组"
  ],
  [
    "Restart Task",
    "重启任务"
  ],
  [
    "Same Project",
    "相同项目"
  ],
  [
    "Save changes",
    "保存更改"
  ],
  [
    "Search flags",
    "搜索功能标记"
  ],
  [
    "See Activity",
    "查看活动记录"
  ],
  [
    "Select Agent",
    "选择智能体"
  ],
  [
    "Select Model",
    "选择模型"
  ],
  [
    "Select Theme",
    "选择主题"
  ],
  [
    "Split Editor",
    "拆分编辑器"
  ],
  [
    "Stacked Diff",
    "上下对比"
  ],
  [
    "Stage change",
    "暂存更改"
  ],
  [
    "Step Details",
    "步骤详情"
  ],
  [
    "Step Preview",
    "步骤预览"
  ],
  [
    "Switch Roles",
    "切换角色"
  ],
  [
    "Sync Changes",
    "同步更改"
  ],
  [
    "Toggle Agent",
    "切换智能体"
  ],
  [
    "User message",
    "用户消息"
  ],
  [
    "Variant Name",
    "变体名称"
  ],
  [
    "Viewing Diff",
    "正在查看差异"
  ],
  [
    "Web (mobile)",
    "Web (移动端网页)"
  ],
  [
    "weekly limit",
    "每周限额"
  ],
  [
    "Weekly limit",
    "每周限额"
  ],
  [
    "Weekly Limit",
    "每周限额"
  ],
  [
    "Working Tree",
    "工作树"
  ],
  [
    "Yesterday at",
    "昨天"
  ],
  [
    "Choose Model",
    "选择模型"
  ],
  [
    "Switch Model",
    "切换模型"
  ],
  [
    "Custom Model",
    "自定义模型"
  ],
  [
    "always allow",
    "永久允许"
  ],
  [
    "Always allow",
    "永久允许"
  ],
  [
    "Approve Plan",
    "批准方案"
  ],
  [
    "approve plan",
    "批准方案"
  ],
  [
    "Zoom Out (-)",
    "缩小界面 (-)"
  ],
  [
    "Amend commit",
    "修改上次提交"
  ],
  [
    "Side by Side",
    "分栏差异对比"
  ],
  [
    "Find in pane",
    "在窗格中查找"
  ],
  [
    "Google Cloud",
    "Google 云平台"
  ],
  [
    "Custom agent",
    "自定义智能体"
  ],
  [
    "Jetski Chat",
    "Jetski 聊天"
  ],
  [
    "or join the",
    "或加入"
  ],
  [
    "Device Name",
    "设备名称"
  ],
  [
    "打开 in Cider",
    "在 Cider 中打开"
  ],
  [
    "Accept Step",
    "接受步骤"
  ],
  [
    "Add context",
    "添加上下文"
  ],
  [
    "Add to Chat",
    "添加到对话"
  ],
  [
    "Agent Edits",
    "智能体编辑"
  ],
  [
    "App version",
    "应用版本"
  ],
  [
    "Application",
    "应用程序"
  ],
  [
    "Automations",
    "自动化"
  ],
  [
    "Cancel step",
    "取消步骤"
  ],
  [
    "Cancel Task",
    "取消任务"
  ],
  [
    "Code Search",
    "代码搜索"
  ],
  [
    "Copy output",
    "复制输出结果"
  ],
  [
    "Copy prompt",
    "复制提示词"
  ],
  [
    "Custom View",
    "自定义视图"
  ],
  [
    "Danger Zone",
    "危险区域"
  ],
  [
    "Delete Hook",
    "删除钩子"
  ],
  [
    "Delete Task",
    "删除任务"
  ],
  [
    "Description",
    "描述"
  ],
  [
    "Enable Chat",
    "启用聊天功能"
  ],
  [
    "Enable Task",
    "启用任务"
  ],
  [
    "File access",
    "文件访问权限"
  ],
  [
    "File Access",
    "文件访问"
  ],
  [
    "File Picker",
    "文件选择器"
  ],
  [
    "File Writes",
    "文件写入"
  ],
  [
    "Focus Input",
    "聚焦输入框"
  ],
  [
    "Forked from",
    "分支来源于"
  ],
  [
    "Full access",
    "完全访问"
  ],
  [
    "Generations",
    "生成轮次"
  ],
  [
    "In Progress",
    "进行中"
  ],
  [
    "JJ worktree",
    "JJ 工作树"
  ],
  [
    "Last 7 days",
    "最近 7 天"
  ],
  [
    "Last Prompt",
    "最新提示词"
  ],
  [
    "Learn more.",
    "了解更多。"
  ],
  [
    "Light Theme",
    "浅色主题"
  ],
  [
    "Mark Unread",
    "标为未读"
  ],
  [
    "Marketplace",
    "扩展插件市场"
  ],
  [
    "MCP servers",
    "MCP 服务器"
  ],
  [
    "MCP Servers",
    "MCP 服务器"
  ],
  [
    "Model Quota",
    "模型配额"
  ],
  [
    "Modified in",
    "已在"
  ],
  [
    "New Project",
    "新建项目"
  ],
  [
    "No branches",
    "无分支"
  ],
  [
    "No Subtitle",
    "无副标题"
  ],
  [
    "Open Folder",
    "打开文件夹"
  ],
  [
    "Permissions",
    "权限"
  ],
  [
    "Planning...",
    "正在规划中..."
  ],
  [
    "Preferences",
    "偏好设置"
  ],
  [
    "Quick Start",
    "快速入门指南"
  ],
  [
    "Recommended",
    "推荐"
  ],
  [
    "Reject Step",
    "拒绝步骤"
  ],
  [
    "Reset State",
    "重置状态"
  ],
  [
    "Run command",
    "运行终端命令"
  ],
  [
    "Sample GDoc",
    "示例 GDoc 文档"
  ],
  [
    "Skills Used",
    "已用技能"
  ],
  [
    "Split Right",
    "向右拆分"
  ],
  [
    "Step Timing",
    "步骤耗时"
  ],
  [
    "Strict Mode",
    "严格模式"
  ],
  [
    "Suggestions",
    "建议"
  ],
  [
    "Tab to Jump",
    "按 Tab 键跳转"
  ],
  [
    "Termination",
    "终止原因"
  ],
  [
    "Thinking...",
    "思考中..."
  ],
  [
    "Token Usage",
    "Token 使用量"
  ],
  [
    "Tomorrow at",
    "明天"
  ],
  [
    "Uncommitted",
    "未提交更改"
  ],
  [
    "Use the IDE",
    "使用当前 IDE"
  ],
  [
    "Write Files",
    "写入文件"
  ],
  [
    "Navigate to",
    "访问"
  ],
  [
    "Check Again",
    "重新检查"
  ],
  [
    "Check again",
    "重新检查"
  ],
  [
    "Review Plan",
    "审阅方案"
  ],
  [
    "review plan",
    "审阅方案"
  ],
  [
    "Zoom In (+)",
    "放大界面 (+)"
  ],
  [
    "Restart Now",
    "立即重启生效"
  ],
  [
    "Agent edits",
    "智能体编辑"
  ],
  [
    "Branch main",
    "主分支 (main)"
  ],
  [
    "branch main",
    "主分支 (main)"
  ],
  [
    "origin/main",
    "远程主分支"
  ],
  [
    "Code Review",
    "代码审核"
  ],
  [
    "Inline Diff",
    "内联差异对比"
  ],
  [
    "Unstage All",
    "全部取消暂存"
  ],
  [
    "File picker",
    "文件选择器"
  ],
  [
    "Focus input",
    "聚焦输入框"
  ],
  [
    "Google Docs",
    "Google 文档"
  ],
  [
    "All Plugins",
    "全部插件"
  ],
  [
    "Turbo mode",
    "极速模式"
  ],
  [
    "Chat space",
    "聊天空间"
  ],
  [
    "chat space",
    "聊天空间"
  ],
  [
    "Legal Help",
    "法律帮助"
  ],
  [
    "Avatar URL",
    "头像 URL"
  ],
  [
    "Your Plan:",
    "您的套餐："
  ],
  [
    "模型 & Usage",
    "模型与用量"
  ],
  [
    "Add Folder",
    "添加文件夹"
  ],
  [
    "Allow once",
    "仅允许一次"
  ],
  [
    "Allow Once",
    "仅允许一次"
  ],
  [
    "Always Ask",
    "每次均询问"
  ],
  [
    "Always run",
    "始终运行"
  ],
  [
    "Appearance",
    "外观"
  ],
  [
    "aria-label",
    "title', 'placeholder', 'alt"
  ],
  [
    "Automation",
    "自动化"
  ],
  [
    "Background",
    "背景色"
  ],
  [
    "Bug Report",
    "错误报告"
  ],
  [
    "Cascade ID",
    "级联 ID"
  ],
  [
    "CHECKPOINT",
    "检查点"
  ],
  [
    "CitC Clone",
    "CitC 克隆"
  ],
  [
    "Copy Image",
    "复制图片"
  ],
  [
    "copy link.",
    "复制链接。"
  ],
  [
    "Copy value",
    "复制值"
  ],
  [
    "Dark Theme",
    "深色主题"
  ],
  [
    "Date Added",
    "添加日期"
  ],
  [
    "Edit Model",
    "编辑模型"
  ],
  [
    "Enterprise",
    "企业版"
  ],
  [
    "Expand All",
    "全部展开"
  ],
  [
    "File Reads",
    "文件读取"
  ],
  [
    "Foreground",
    "前景色"
  ],
  [
    "Full Error",
    "完整错误信息"
  ],
  [
    "Go Forward",
    "前进"
  ],
  [
    "Group name",
    "分组名称"
  ],
  [
    "Invocation",
    "调用执行"
  ],
  [
    "Learn more",
    "了解更多"
  ],
  [
    "Loading...",
    "加载中..."
  ],
  [
    "Match case",
    "区分大小写"
  ],
  [
    "Move Right",
    "向右移动"
  ],
  [
    "Move to...",
    "移动到..."
  ],
  [
    "Navigation",
    "导航"
  ],
  [
    "New Branch",
    "新建分支"
  ],
  [
    "Next match",
    "下一个匹配项"
  ],
  [
    "No commits",
    "无提交"
  ],
  [
    "No Project",
    "无项目"
  ],
  [
    "No Results",
    "无结果"
  ],
  [
    "No uploads",
    "无上传文件"
  ],
  [
    "Provide 反馈",
    "提供反馈"
  ],
  [
    "Queue Wait",
    "队列等待时间"
  ],
  [
    "Read Files",
    "读取文件"
  ],
  [
    "Reset Zoom",
    "重置缩放比例"
  ],
  [
    "Scratchpad",
    "便签草稿"
  ],
  [
    "Screenshot",
    "屏幕截图"
  ],
  [
    "Select all",
    "全选"
  ],
  [
    "Select All",
    "全选"
  ],
  [
    "Split Diff",
    "分栏差异对比"
  ],
  [
    "Split Down",
    "向下拆分"
  ],
  [
    "Split Left",
    "向左拆分"
  ],
  [
    "Turbo Mode",
    "极速模式"
  ],
  [
    "UI Actions",
    "界面操作"
  ],
  [
    "UI Plugins",
    "UI 插件"
  ],
  [
    "View Debug",
    "查看调试信息"
  ],
  [
    "Working...",
    "正在工作..."
  ],
  [
    "Workspaces",
    "工作区列表"
  ],
  [
    "(Thinking)",
    "(深度思考)"
  ],
  [
    "(thinking)",
    "(深度思考)"
  ],
  [
    "Whitespace",
    "空白字符"
  ],
  [
    "Main Agent",
    "主智能体"
  ],
  [
    "main agent",
    "主智能体"
  ],
  [
    "All Skills",
    "全部技能"
  ],
  [
    "Mcp Tools",
    "MCP 工具"
  ],
  [
    "Add Model",
    "添加模型"
  ],
  [
    "Analyzing",
    "正在分析"
  ],
  [
    "Artifacts",
    "产物文件"
  ],
  [
    "Ask first",
    "操作前先询问"
  ],
  [
    "Best of N",
    "Best-of-N 多路优选"
  ],
  [
    "Clear all",
    "清除全部"
  ],
  [
    "Clear All",
    "全部清除"
  ],
  [
    "Close Tab",
    "关闭标签页"
  ],
  [
    "Completed",
    "已完成"
  ],
  [
    "copy link",
    "复制链接"
  ],
  [
    "Copy path",
    "复制路径"
  ],
  [
    "Copy Path",
    "复制路径"
  ],
  [
    "Customize",
    "自定义"
  ],
  [
    "Developer",
    "开发者"
  ],
  [
    "Duplicate",
    "创建副本"
  ],
  [
    "Execution",
    "执行"
  ],
  [
    "Exploring",
    "正在探索"
  ],
  [
    "Extension",
    "浏览器插件/扩展"
  ],
  [
    "In a rush",
    "时间紧迫"
  ],
  [
    "Knowledge",
    "知识库"
  ],
  [
    "Launchpad",
    "启动台"
  ],
  [
    "Mark Read",
    "标为已读"
  ],
  [
    "MCP Tools",
    "MCP 工具"
  ],
  [
    "Move Down",
    "向下移动"
  ],
  [
    "Move Left",
    "向左移动"
  ],
  [
    "New Group",
    "新建分组"
  ],
  [
    "No access",
    "无访问权限"
  ],
  [
    "No groups",
    "暂无分组"
  ],
  [
    "No Layout",
    "无布局"
  ],
  [
    "Not in 项目",
    "未在项目中"
  ],
  [
    "Open Diff",
    "打开差异对比"
  ],
  [
    "Open File",
    "打开文件"
  ],
  [
    "Read URLs",
    "读取 URL"
  ],
  [
    "Recording",
    "录制文件"
  ],
  [
    "Remaining",
    "剩余"
  ],
  [
    "Sandboxed",
    "沙盒化"
  ],
  [
    "Search...",
    "搜索..."
  ],
  [
    "Searching",
    "正在搜索"
  ],
  [
    "See Plans",
    "查看套餐方案"
  ],
  [
    "Selection",
    "选择"
  ],
  [
    "Shortcuts",
    "快捷键"
  ],
  [
    "Step Type",
    "步骤类型"
  ],
  [
    "Subagents",
    "子智能体"
  ],
  [
    "Subtitles",
    "副标题"
  ],
  [
    "Tab Speed",
    "Tab 补全响应速度"
  ],
  [
    "Task Logs",
    "任务日志"
  ],
  [
    "Terminals",
    "终端"
  ],
  [
    "This step",
    "此步骤"
  ],
  [
    "Triggered",
    "已触发"
  ],
  [
    "Unarchive",
    "取消归档"
  ],
  [
    "User Type",
    "用户身份类型"
  ],
  [
    "View Diff",
    "查看差异"
  ],
  [
    "View Page",
    "查看页面"
  ],
  [
    "Wednesday",
    "星期三"
  ],
  [
    "Working..",
    "正在工作.."
  ],
  [
    "Workspace",
    "工作区"
  ],
  [
    "Yesterday",
    "昨天"
  ],
  [
    "Thinking:",
    "深度思考："
  ],
  [
    "(Default)",
    "(默认)"
  ],
  [
    "Resets in",
    "重置倒计时："
  ],
  [
    "File diff",
    "文件差异对比"
  ],
  [
    "Show Diff",
    "显示差异对比"
  ],
  [
    "Untracked",
    "未跟踪"
  ],
  [
    "Stage All",
    "全部暂存"
  ],
  [
    "Open docs",
    "打开文档"
  ],
  [
    "open docs",
    "打开文档"
  ],
  [
    "Close tab",
    "关闭标签页"
  ],
  [
    "Installed",
    "已安装"
  ],
  [
    "Show All",
    "显示全部"
  ],
  [
    "Hide All",
    "隐藏全部"
  ],
  [
    "Bot Name",
    "机器人名称"
  ],
  [
    "[MODIFY]",
    "[修改]"
  ],
  [
    "+ New 对话",
    "+ 新建对话"
  ],
  [
    "对话 Width",
    "对话宽度"
  ],
  [
    "Activity",
    "活动"
  ],
  [
    "Advanced",
    "高级"
  ],
  [
    "Analyzed",
    "已分析"
  ],
  [
    "Approval",
    "审批确认"
  ],
  [
    "Archived",
    "已归档"
  ],
  [
    "Artifact",
    "产物文件"
  ],
  [
    "Branches",
    "分支列表"
  ],
  [
    "By phase",
    "按阶段分类"
  ],
  [
    "Canceled",
    "已取消"
  ],
  [
    "Commands",
    "命令"
  ],
  [
    "Continue",
    "继续"
  ],
  [
    "Details:",
    "详情："
  ],
  [
    "Disabled",
    "已禁用"
  ],
  [
    "Download",
    "下载"
  ],
  [
    "Explored",
    "已探索"
  ],
  [
    "External",
    "外部用户"
  ],
  [
    "Feedback",
    "反馈"
  ],
  [
    "Group By",
    "分组方式"
  ],
  [
    "lastWeek",
    "上周"
  ],
  [
    "Maximize",
    "最大化"
  ],
  [
    "MCP tool",
    "MCP 工具"
  ],
  [
    "Mentions",
    "提及 (@)"
  ],
  [
    "Minimize",
    "最小化"
  ],
  [
    "Modified",
    "已修改"
  ],
  [
    "nextWeek",
    "下周"
  ],
  [
    "Nickname",
    "昵称"
  ],
  [
    "No diffs",
    "无差异"
  ],
  [
    "Open App",
    "打开应用"
  ],
  [
    "Open IDE",
    "打开 IDE"
  ],
  [
    "Open URL",
    "打开 URL"
  ],
  [
    "Overview",
    "概览"
  ],
  [
    "Planning",
    "规划"
  ],
  [
    "Previous",
    "上一步"
  ],
  [
    "Projects",
    "项目列表"
  ],
  [
    "Read URL",
    "读取 URL"
  ],
  [
    "Saturday",
    "星期六"
  ],
  [
    "Save All",
    "保存全部"
  ],
  [
    "Searched",
    "已搜索"
  ],
  [
    "See less",
    "收起"
  ],
  [
    "Send Now",
    "立即发送"
  ],
  [
    "Settings",
    "设置"
  ],
  [
    "Show all",
    "显示全部"
  ],
  [
    "Sign Out",
    "退出登录"
  ],
  [
    "Split Up",
    "向上拆分"
  ],
  [
    "Starting",
    "正在启动"
  ],
  [
    "Terminal",
    "终端"
  ],
  [
    "Thoughts",
    "思考过程"
  ],
  [
    "Thursday",
    "星期四"
  ],
  [
    "Today at",
    "今天"
  ],
  [
    "Tomorrow",
    "明天"
  ],
  [
    "Worktree",
    "工作树"
  ],
  [
    "Zoom out",
    "缩小"
  ],
  [
    "Zoom Out",
    "缩小界面"
  ],
  [
    "Thinking",
    "深度思考"
  ],
  [
    "(Medium)",
    "(中)"
  ],
  [
    "Unstaged",
    "未暂存"
  ],
  [
    "commands",
    "命令"
  ],
  [
    "Firebase",
    "Firebase 后端云"
  ],
  [
    "Built In",
    "内置"
  ],
  [
    "Built-in",
    "内置"
  ],
  [
    "Built in",
    "内置"
  ],
  [
    "& Usage",
    "与用量"
  ],
  [
    "Account",
    "账户"
  ],
  [
    "Actions",
    "操作"
  ],
  [
    "Add MCP",
    "添加 MCP"
  ],
  [
    "Archive",
    "归档"
  ],
  [
    "Backoff",
    "重试退避"
  ],
  [
    "Blocked",
    "已阻塞"
  ],
  [
    "Browser",
    "浏览器"
  ],
  [
    "Changes",
    "文件更改"
  ],
  [
    "Command",
    "命令"
  ],
  [
    "Confirm",
    "确认"
  ],
  [
    "Context",
    "上下文"
  ],
  [
    "Default",
    "默认"
  ],
  [
    "Deleted",
    "已删除"
  ],
  [
    "Details",
    "详情"
  ],
  [
    "Discard",
    "放弃更改"
  ],
  [
    "Dismiss",
    "忽略"
  ],
  [
    "Enabled",
    "已启用"
  ],
  [
    "Filters",
    "筛选"
  ],
  [
    "Folders",
    "文件夹"
  ],
  [
    "General",
    "常规"
  ],
  [
    "Go Back",
    "返回"
  ],
  [
    "History",
    "历史"
  ],
  [
    "Inherit",
    "继承"
  ],
  [
    "Mention",
    "提及"
  ],
  [
    "Move Up",
    "向上移动"
  ],
  [
    "Options",
    "选项"
  ],
  [
    "Plugins",
    "插件"
  ],
  [
    "Proceed",
    "继续执行"
  ],
  [
    "Project",
    "项目"
  ],
  [
    "Refresh",
    "刷新"
  ],
  [
    "Renamed",
    "已重命名"
  ],
  [
    "Restart",
    "重启"
  ],
  [
    "Restore",
    "恢复"
  ],
  [
    "Running",
    "运行中"
  ],
  [
    "Science",
    "科学"
  ],
  [
    "Sidebar",
    "侧边栏"
  ],
  [
    "Stopped",
    "已停止"
  ],
  [
    "Success",
    "成功"
  ],
  [
    "Summary",
    "总结摘要"
  ],
  [
    "Thought",
    "思考"
  ],
  [
    "Tuesday",
    "星期二"
  ],
  [
    "Unknown",
    "未知"
  ],
  [
    "Updater",
    "更新器"
  ],
  [
    "Upgrade",
    "升级"
  ],
  [
    "Uploads",
    "上传列表"
  ],
  [
    "Version",
    "版本"
  ],
  [
    "Warning",
    "警告"
  ],
  [
    "Windows",
    "Windows"
  ],
  [
    "Working",
    "正在工作"
  ],
  [
    "Writing",
    "写入中"
  ],
  [
    "Zoom in",
    "放大"
  ],
  [
    "Zoom In",
    "放大界面"
  ],
  [
    "New Tab",
    "新建标签页"
  ],
  [
    "New tab",
    "新建标签页"
  ],
  [
    "Accent",
    "强调色"
  ],
  [
    "Accept",
    "接受"
  ],
  [
    "Agents",
    "智能体列表"
  ],
  [
    "Before",
    "变更前"
  ],
  [
    "Branch",
    "分支"
  ],
  [
    "Browse",
    "浏览"
  ],
  [
    "Cancel",
    "取消"
  ],
  [
    "Commit",
    "提交"
  ],
  [
    "Copied",
    "已复制"
  ],
  [
    "Create",
    "创建"
  ],
  [
    "Custom",
    "自定义"
  ],
  [
    "Delete",
    "删除"
  ],
  [
    "Edited",
    "已编辑"
  ],
  [
    "Editor",
    "编辑器"
  ],
  [
    "Error:",
    "错误："
  ],
  [
    "Errors",
    "错误"
  ],
  [
    "Europe",
    "欧洲"
  ],
  [
    "Export",
    "导出"
  ],
  [
    "Failed",
    "失败"
  ],
  [
    "Filter",
    "筛选"
  ],
  [
    "Friday",
    "星期五"
  ],
  [
    "GitHub",
    "GitHub"
  ],
  [
    "Global",
    "全局"
  ],
  [
    "Got it",
    "知道了"
  ],
  [
    "Hourly",
    "每小时"
  ],
  [
    "Ignore",
    "忽略"
  ],
  [
    "Import",
    "导入"
  ],
  [
    "Log in",
    "登录"
  ],
  [
    "Medium",
    "中"
  ],
  [
    "Models",
    "模型"
  ],
  [
    "Monday",
    "星期一"
  ],
  [
    "Narrow",
    "窄"
  ],
  [
    "Output",
    "输出"
  ],
  [
    "Picker",
    "选择器"
  ],
  [
    "Pinned",
    "已固定"
  ],
  [
    "Preset",
    "预设"
  ],
  [
    "Recent",
    "最近使用"
  ],
  [
    "Reject",
    "拒绝"
  ],
  [
    "Reload",
    "重新加载"
  ],
  [
    "Remove",
    "移除"
  ],
  [
    "Rename",
    "重命名"
  ],
  [
    "Resume",
    "继续"
  ],
  [
    "Revert",
    "还原"
  ],
  [
    "Review",
    "代码审核"
  ],
  [
    "Run JS",
    "运行 JavaScript"
  ],
  [
    "Search",
    "搜索"
  ],
  [
    "Skills",
    "技能列表"
  ],
  [
    "Snooze",
    "稍后提醒"
  ],
  [
    "Status",
    "状态"
  ],
  [
    "Strict",
    "严格"
  ],
  [
    "Submit",
    "提交"
  ],
  [
    "Sunday",
    "星期日"
  ],
  [
    "System",
    "系统"
  ],
  [
    "Tokens",
    "令牌"
  ],
  [
    "Upload",
    "上传"
  ],
  [
    "Uptime",
    "已连续运行时间"
  ],
  [
    "Value:",
    "当前值："
  ],
  [
    "Weekly",
    "每周"
  ],
  [
    "Window",
    "窗口"
  ],
  [
    "(Fast)",
    "(快速)"
  ],
  [
    "(Slow)",
    "(慢速)"
  ],
  [
    "(High)",
    "(高)"
  ],
  [
    "Staged",
    "已暂存"
  ],
  [
    "About",
    "关于"
  ],
  [
    "After",
    "变更后"
  ],
  [
    "Allow",
    "允许"
  ],
  [
    "Apply",
    "应用"
  ],
  [
    "Audio",
    "音频文件"
  ],
  [
    "Block",
    "屏蔽"
  ],
  [
    "Clear",
    "清除"
  ],
  [
    "Close",
    "关闭"
  ],
  [
    "Daily",
    "每天"
  ],
  [
    "Email",
    "电子邮件"
  ],
  [
    "Error",
    "错误"
  ],
  [
    "Files",
    "文件"
  ],
  [
    "First",
    "第一项"
  ],
  [
    "Hooks",
    "钩子"
  ],
  [
    "Linux",
    "Linux"
  ],
  [
    "Local",
    "本地"
  ],
  [
    "MacOS",
    "macOS"
  ],
  [
    "Media",
    "媒体文件"
  ],
  [
    "MODEL",
    "模型"
  ],
  [
    "Notes",
    "笔记便签"
  ],
  [
    "Paste",
    "粘贴"
  ],
  [
    "Pause",
    "暂停"
  ],
  [
    "Queue",
    "排队"
  ],
  [
    "Quota",
    "额度配额"
  ],
  [
    "Retry",
    "重试"
  ],
  [
    "Rules",
    "规则"
  ],
  [
    "Setup",
    "安装配置"
  ],
  [
    "Share",
    "分享"
  ],
  [
    "Split",
    "拆分窗格"
  ],
  [
    "Steps",
    "执行步骤"
  ],
  [
    "Theme",
    "界面主题"
  ],
  [
    "Today",
    "今天"
  ],
  [
    "Turbo",
    "极速模式"
  ],
  [
    "Unpin",
    "取消置顶"
  ],
  [
    "Usage",
    "用量"
  ],
  [
    "Video",
    "视频文件"
  ],
  [
    "Write",
    "写入"
  ],
  [
    "(Low)",
    "(低)"
  ],
  [
    "Model",
    "模型"
  ],
  [
    "Amend",
    "修改上次提交"
  ],
  [
    "Added",
    "新增"
  ],
  [
    "Back",
    "返回"
  ],
  [
    "Copy",
    "复制"
  ],
  [
    "Deny",
    "拒绝"
  ],
  [
    "Diff",
    "差异对比"
  ],
  [
    "Done",
    "完成"
  ],
  [
    "Edit",
    "编辑"
  ],
  [
    "Fast",
    "快"
  ],
  [
    "File",
    "文件"
  ],
  [
    "Find",
    "查找"
  ],
  [
    "Fork",
    "创建分支"
  ],
  [
    "Help",
    "帮助"
  ],
  [
    "High",
    "高"
  ],
  [
    "Idle",
    "空闲"
  ],
  [
    "Labs",
    "实验室"
  ],
  [
    "Last",
    "最后一项"
  ],
  [
    "Logs",
    "日志"
  ],
  [
    "Next",
    "下一步"
  ],
  [
    "None",
    "无"
  ],
  [
    "Open",
    "打开"
  ],
  [
    "Plan",
    "套餐方案"
  ],
  [
    "Pull",
    "拉取"
  ],
  [
    "Push",
    "推送"
  ],
  [
    "Quit",
    "退出"
  ],
  [
    "Read",
    "读取"
  ],
  [
    "Redo",
    "重做"
  ],
  [
    "Save",
    "保存"
  ],
  [
    "Show",
    "显示"
  ],
  [
    "Skip",
    "跳过"
  ],
  [
    "Slow",
    "慢"
  ],
  [
    "Sort",
    "排序"
  ],
  [
    "Step",
    "执行步骤"
  ],
  [
    "Stop",
    "停止"
  ],
  [
    "TOOL",
    "工具"
  ],
  [
    "Undo",
    "撤销"
  ],
  [
    "USER",
    "用户"
  ],
  [
    "View",
    "查看"
  ],
  [
    "Wide",
    "宽"
  ],
  [
    "套餐方案",
    "方案"
  ],
  [
    "Cut",
    "剪切"
  ],
  [
    "now",
    "刚刚"
  ],
  [
    "Pin",
    "置顶"
  ],
  [
    "Ran",
    "已运行"
  ],
  [
    "Run",
    "运行"
  ],
  [
    "Tab",
    "标签页"
  ],
  [
    "Tip",
    "提示"
  ],
  [
    "Use",
    "使用"
  ],
  [
    "Yes",
    "是"
  ],
  [
    "Low",
    "低"
  ],
  [
    "low",
    "低"
  ],
  [
    "All",
    "全部"
  ],
  [
    "AM",
    "上午"
  ],
  [
    "PM",
    "下午"
  ],
  [
    "Compacting",
    "正在压缩上下文..."
  ],
  [
    "Compacting...",
    "正在压缩上下文..."
  ],
  [
    "Compacted",
    "已压缩上下文"
  ],
  [
    "Explored files, ran command",
    "已探索文件并运行命令"
  ],
  [
    "Explored files, ran commands",
    "已探索文件并运行命令"
  ],
  [
    "Explored files, ran commands.",
    "已探索文件并运行命令"
  ],
  [
    "Explored, ran commands",
    "已探索并运行命令"
  ],
  [
    "Ran commands, edited files",
    "已运行命令并编辑文件"
  ],
  [
    "Explored, edited files",
    "已探索并编辑文件"
  ],
  [
    "Edited files, ran commands",
    "已编辑文件并运行命令"
  ],
  [
    "Ran commands",
    "已运行命令"
  ],
  [
    "Edited files",
    "已编辑文件"
  ],
  [
    "Explored files",
    "已探索文件"
  ],
  [
    "DevTools port is still closed. Please make sure Chrome is running with remote debugging enabled.",
    "DevTools 调试端口仍处于关闭状态。请确保 Chrome 已启用远程调试并正在运行。"
  ],
  [
    "DevTools port is still closed. Please make sure Chrome is running with remote debugging enabled",
    "DevTools 调试端口仍处于关闭状态。请确保 Chrome 已启用远程调试并正在运行。"
  ],
  [
    "Proceed Anyway",
    "仍然继续"
  ],
  [
    "Check again",
    "重新检查"
  ],
  [
    "Check Again",
    "重新检查"
  ],
  [
    "Tool arguments",
    "工具参数"
  ],
  [
    "Tool arguments:",
    "工具参数："
  ],
  [
    "Tool Arguments",
    "工具参数"
  ],
  [
    "Tool Arguments:",
    "工具参数："
  ],
  [
    "Tool Output",
    "工具输出"
  ],
  [
    "Tool Output:",
    "工具输出："
  ],
  [
    "Tool output",
    "工具输出"
  ],
  [
    "Tool output:",
    "工具输出："
  ],
  [
    "Pages",
    "页面"
  ],
  [
    "Pages:",
    "页面："
  ],
  [
    "[selected]",
    "[已选]"
  ],
  [
    "Copy Image",
    "复制图片"
  ],
  [
    "Save Image",
    "保存图片"
  ],
  [
    "Copy image",
    "复制图片"
  ],
  [
    "Save image",
    "保存图片"
  ],
  [
    "Save Image As...",
    "图片另存为..."
  ],
  [
    "Copy Image Address",
    "复制图片地址"
  ]
];
    const phrases = Array.isArray(rawPhrases) ? rawPhrases : Object.values(rawPhrases);
    const EXACT_MAP = new Map();
    for (let i = 0; i < phrases.length; i++) {
      const p = phrases[i];
      if (p && p[0] && p[1]) {
        EXACT_MAP.set(p[0].trim(), p[1]);
      }
    }

    // 1.1 用户个性化自定义词典支持 (User Custom Dictionary - 最高优先级)
    const USER_CUSTOM_MAP = new Map();
    function loadUserCustomDict(dictObj) {
      USER_CUSTOM_MAP.clear();
      if (!dictObj || typeof dictObj !== 'object') return;
      for (const k in dictObj) {
        if (Object.prototype.hasOwnProperty.call(dictObj, k) && dictObj[k]) {
          USER_CUSTOM_MAP.set(k.trim(), dictObj[k]);
        }
      }
    }

    try {
      if (typeof window !== 'undefined' && window.__antigravityCustomDict) {
        loadUserCustomDict(window.__antigravityCustomDict);
      } else if (typeof localStorage !== 'undefined') {
        const savedCustom = localStorage.getItem('antigravity_user_custom_dict');
        if (savedCustom) {
          loadUserCustomDict(JSON.parse(savedCustom));
        }
      }
    } catch (e) {}

    if (typeof window !== 'undefined') {
      window.updateAntigravityCustomDict = function(dictObj) {
        try {
          loadUserCustomDict(dictObj);
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('antigravity_user_custom_dict', JSON.stringify(dictObj || {}));
          }
          if (typeof window.reapplyAntigravityZh === 'function') {
            window.reapplyAntigravityZh();
          }
        } catch (e) {}
      };
    }


    // 2. 正则模式匹配库（针对动态数字、状态卡片、复合时间、拆分节点、单位）
    const patterns = [
      // ========================================================================
      // 最新版本 2.24~2.27 动态界面与正则模式补充
      // ========================================================================
      [/^Goals\s+(\d+)$/gi, '目标 $1'],
      [/^(\d+)\s+subagents?$/gi, '$1 个子智能体'],
      [/^(.+?)\s+\((\d+)\s+subagents?\)$/gi, '$1 ($2 个子智能体)'],
      [/^You\s+have\s+used\s+some\s+of\s+your\s+weekly\s+limit,\s+it\s+will\s+fully\s+refresh\s+in\s+(.+?)\.?$/gi, '您已使用部分每周额度，将在 $1 后完全刷新。'],
      [/^You\s+have\s+used\s+some\s+of\s+your\s+5-hour\s+limit,\s+it\s+will\s+fully\s+refresh\s+in\s+(.+?)\.?$/gi, '您已使用部分 5 小时额度，将在 $1 后完全刷新。'],
      [/^it\s+will\s+fully\s+refresh\s+in\s+(.+?)\.?$/gi, '将在 $1 后完全刷新。'],
      [/^fully\s+refresh\s+in\s+(.+?)\.?$/gi, '将在 $1 后完全刷新。'],
      [/^\s*Permission\s+Preset\s*$/gi, '权限预设'],
      [/^\s*Automatically\s+decide\s+if\s+commands\s+run\.?\s*$/gi, '自动判断是否运行命令。'],
      [/^\s*Give\s+Feedback\s*$/gi, '问题反馈'],
      [/^\s*Show\s+system\s+notifications\s+when\s+your\s+action\s+is\s+needed\s+or\s+the\s+agent\s+finishes\.?\s*$/gi, '当需要您操作或智能体完成任务时显示系统通知。'],
      [/^\s*Play\s+a\s+sound\s+when\s+your\s+action\s+is\s+needed\s+or\s+the\s+agent\s+finishes\.?\s*$/gi, '当需要您操作或智能体完成任务时播放提示音。'],
      [/^\s*Set\s+the\s+volume\s+of\s+agent\s+sounds\.?\s*$/gi, '设置智能体提示音的音量。'],


      // 项目设置抽屉、权限下拉框与动态明细模式
      [/^Show\s+(\d+)\s+breakdowns?$/gi, '查看 $1 项明细'],
      [/^Rules\s*(\d+)$/gi, '规则 $1'],
      [/^Skills\s*(\d+)$/gi, '技能 $1'],
      [/^Toggle\s+(.+)$/gi, '切换 $1'],
      [/^(?:删除|Delete)\s+plugin$/gi, '删除插件'],
      [/^(?:排队|Queue)\s+until\s+after\s+the\s+current\s+turn\.?$/gi, '在本轮对话后排队'],
      [/^Interrupt\s+the\s+agent\s+and\s+send\s+immediately\.?$/gi, '打断智能体并立即发送'],
      [/^Light$/g, '浅色'],
      [/^Dark$/g, '深色'],
      [/^Contrast$/g, '对比度'],
      [/^Strong$/g, '高对比'],
      [/^Default$/g, '默认'],
      [/^Custom$/g, '自定义'],
      [/^tokens\s*\(/gi, 'tokens ('],
      [/^Other\s+(?:自定义|Customizations)$/gi, '其他自定义项'],
      [/(?:项目\s*4K|Project\s*4K)\s*interface\s*without\s*developer\s*tooling\.?/gi, '无开发工具的 4K 纯净界面。'],
      [/Choose\s+between\s+the\s+(?:默认|Default)\s+and\s+(?:项目\s*4K|Project\s*4K)\s+experience\.?/gi, '在默认与项目 4K 体验之间进行选择。'],
      [/(?:开发者-only|Developer-only)\s+tools\.\s*These\s+settings\s+are\s+stored\s+locally\s+in\s+this\s+browser\s+and\s+do\s+not\s+affect\s+other\s+users\.?/gi, '仅供开发者使用的工具。这些设置仅保存在本地浏览器中，不会影响其他用户。'],
      [/^(?:显示|Show)\s+All$/gi, '显示全部'],
      [/^(?:置顶|Pin)\s+conversation$/gi, '置顶对话'],

      [/^\s*Inherit\s+Global\s*$/gi, '继承全局'],
      [/^\s*Inherits\s+your\s+Global\s+Permissions\s+when\s+working\s+in\s+this\s+project\.?\s*$/gi, '在此项目中工作时继承您的全局权限。'],
      [/^\s*Permanently\s+delete\s+(.+?)\s+including\s+(\d+)\s+active\s+conversations?\.?\s*$/gi, '永久删除 $1，包含 $2 个活动对话。'],
      [/^\s*Permanently\s+delete\s+(.*?)\s*$/gi, '永久删除 $1'],
      // ========================================================================
      // 输入框与占位提示 (Placeholder & Composer)
      // ========================================================================
      [/^\s*Ask\s+anything,\s*@\s*to\s*mention,\s*\/(\s*for\s*actions)?\.?\s*$/gi, '向智能体提问，输入 @ 提及，输入 / 查看指令'],
      [/^\s*Ask\s+anything\s*$/gi, '向智能体提问'],
      [/^\s*@\s*to\s*mention\s*$/gi, '@ 提及'],
      [/^\s*\/\s*for\s*actions\s*$/gi, '/ 查看指令'],
      [/^\s*Message\s+input\s*$/gi, '消息输入框'],

      // ========================================================================
      // 斜杠命令 (Slash Commands) 描述文案全量深度汉化
      // ========================================================================
      [/^\s*Ask\s+a\s+quick\s+question\s+without\s+interrupting\s+the\s+main\s+conversation\.?\s*$/gi, '在不打断主对话的情况下快速提问。'],
      [/^\s*Run\s+until\s+the\s+specified\s+goal\s+is\s+completely\s+finished\.?\s*$/gi, '持续运行直至完全达成指定目标。'],
      [/^\s*Run\s+an\s+instruction\s+on\s+a\s+recurring\s+schedule\s+or\s+as\s+a\s+one-time\s+timer\.?\s*$/gi, '按循环计划或一次性定时器执行指令。'],
      [/^\s*Invoke\s+a\s+browser\s+agent\s+for\s+web\s+tasks\.?\s*$/gi, '唤起浏览器智能体执行网页自动化任务。'],
      [/^\s*Interview\s+me\s+to\s+align\s+on\s+a\s+plan\.?\s*$/gi, '通过深度访谈对齐方案与需求细节。'],
      [/^\s*Invoke\s+a\s+team\s+of\s+agents\s+to\s+autonomously\s+tackle\s+large\s+projects\.?\s*$/gi, '唤起多智能体团队协作自主攻坚大型项目。'],
      [/^\s*Reflect\s+on\s+recent\s+successes\s+or\s+corrections\s+to\s+capture\s+reusable\s+skills\s+or\s+rules\.?\s*$/gi, '复盘近期经验与纠正，沉淀可复用技能或规则。'],
      [/^\s*Invoke\s+the\s+Boost\s+multi-agent\s+orchestrator\s+for\s+complex\s+tasks\.?\s*$/gi, '唤起 Boost 多智能体编排器处理高复杂度任务。'],

      // ========================================================================
      // 官方技能 (Skills) 描述全量汉化
      // ========================================================================
      [/Comprehensive\s+guide\s+and\s+reference\s+for\s+the\s+Antigravity\s+Customization\s+System\.[\s\S]*?MCP\s+servers\.?/gi, 'Antigravity 自定义系统的全方位指南与参考，涵盖技能、规则、插件与 MCP 机制。'],
      [/Provides\s+instructions\s+for\s+installing\s+and\s+using\s+the\s+`?android`?\s+CLI\.[\s\S]*?official\s+Android\s+skills\.?/gi, '提供安装与使用 android CLI 的完整指南，包含 Android 开发、设备运行与 SDK 管理。'],
      [/Provides\s+a\s+comprehensive\s+guide,\s*quick\s+reference,\s*and\s+sitemap\s+for\s+Google\s+Antigravity\s+\(AGY\)[\s\S]*?Antigravity\s+2\.0\.?/gi, 'Google Antigravity (AGY) 官方综合指南与速查手册，包含命令行、IDE、快捷键与配置定制。'],
      [/Use\s+this\s+skill\s+when\s+writing\s+code\s+that\s+calls\s+the\s+Gemini\s+API\s+for\s+text\s+generation[\s\S]*?Python\s+and\s+TypeScript\.?/gi, '调用 Gemini API 进行文本生成、多模态理解、流式响应与函数调用的开发指南。'],
      [/This\s+skill\s+covers\s+the\s+Interactions\s+API,\s*the\s+recommended\s+way\s+to\s+use\s+Gemini\s+models[\s\S]*?TypeScript\.?/gi, '使用官方推荐的 Interactions API 开发 Gemini 智能体与模型的开发指南。'],
      [/Use\s+this\s+skill\s+when\s+building\s+real-time,\s*bidirectional\s+streaming\s+applications\s+with\s+the\s+Gemini\s+Live\s+API\.[\s\S]*?JavaScript\/TypeScript\)\.?/gi, '构建 Gemini Live API 实时双向音视频流与语音交互应用的开发指南。'],
      [/Use\s+this\s+skill\s+for\s+generative\s+video\s+editing[\s\S]*?parallel\s+execution\.?/gi, '使用 Gemini Omni 1.1 Flash 进行生成式视频编辑与文本生视频的开发指南。'],
      [/How\s+to\s+render\s+rich\s+interactive\s+HTML\s+widgets\s+inline\s+in\s+the\s+chat\s+or\s+as\s+standalone\s+artifacts\.[\s\S]*?plain\s+text\s+and\s+markdown\.?/gi, '在聊天中内联或作为独立产物渲染丰富的交互式 HTML 小部件、图表与可视化控件。'],
      [/Automatically\s+migrate\s+legacy\s+workflows\s+to\s+modern\s+skills[\s\S]*?archive\s+old\s+workflow\s+files\.?/gi, '自动将全局和工作区的旧版工作流迁移至现代化技能，安全归档旧文件。'],

      // ========================================================================
      // 代码变更、审核栏与审查按钮 (Diff & Review)
      // ========================================================================
      [/^\s*Review\s*$/g, '审核'],
      [/^\s*(\d+)\s+files?\s+changed\s*$/gi, '$1 项文件更改'],
      [/(\d+)\s+files?\s+changed/gi, '$1 项文件更改'],

      // 命令面板与对话操作强力防中英混杂规则 (置顶/重命名/归档等)
      [/^(?:Pin|置顶)\s+this\s+conversation$/gi, '置顶此对话'],
      [/^(?:Rename|重命名)\s+this\s+conversation$/gi, '重命名此对话'],
      [/^(?:Unpin|取消置顶)\s+this\s+conversation$/gi, '取消置顶此对话'],
      [/^(?:Archive|归档)\s+this\s+conversation$/gi, '归档此对话'],
      [/^(?:Delete|删除)\s+this\s+conversation$/gi, '删除此对话'],
      [/^(?:Duplicate|创建副本|复制)\s+this\s+conversation$/gi, '创建此对话副本'],
      [/^(?:Share|分享|共享)\s+this\s+conversation$/gi, '共享此对话'],
      [/^(?:Fork|分支)\s+this\s+conversation$/gi, '创建此对话分支'],
      [/^(?:Copy\s+conversation\s+markdown|复制对话\s+Markdown)$/gi, '复制对话为 Markdown'],
      [/^Copy\s+conversation\s+as\s+Markdown$/gi, '复制对话为 Markdown'],
      [/^Commands$/gi, '命令'],
      [/^Commands\s+list$/gi, '命令列表'],
      [/^Main\s+Agent$/gi, '主智能体'],
      [/^Click\s+to\s+open\s+docs$/gi, '点击查看文档'],
      [/^Click\s+to\s+open\s+documentation$/gi, '点击查看文档'],
      [/^Open\s+docs$/gi, '打开文档'],

      // 会话标题自动转译与防英文智能匹配规则
      [/^Continue\s+(?:Antigravity\s+Translation|Antigravity\s+Translate)(?:\.\.\.)?$/gi, 'Antigravity汉化推进'],
      [/^Rule\s+Review\s+And\s+Improvement(?:\.\.\.)?$/gi, '规则审查与完善'],
      [/^Antigravity\s+Localization(?:\.\.\.)?$/gi, 'Antigravity汉化'],
      [/^Troubleshooting\s+Persistence(?:\.\.\.)?$/gi, '排查持久化问题'],
      [/^Continue\s+(.+)$/gi, '继续 $1'],
      [/^Review\s+and\s+Improve(?:ment)?(?:\s+(.*))?$/gi, '审查与完善 $1'],

      // Token 使用量明细与插件标签
      [/(?:Show|显示)\s+(\d+)\s+breakdowns?\.?/gi, '查看 $1 项明细'],
      [/(?:Hide|隐藏)\s+(\d+)\s+breakdowns?\.?/gi, '隐藏 $1 项明细'],
      [/(?:Show|显示)\s+breakdowns?\.?/gi, '查看明细'],
      [/(?:Hide|隐藏)\s+breakdowns?\.?/gi, '隐藏明细'],
      [/(\d+)\s+breakdowns?/gi, '$1 项明细'],
      [/^Plugin:\s*(.+)$/gi, '插件：$1'],

      // 审核面板与分支切换下拉菜单专项规则 (前后允许任意空格，彻底覆盖单选按钮与下拉项)
      [/^\s*Uncommitted(?:\s+changes?)?\.?\s*$/gi, '未提交更改'],
      [/^\s*Agent\s+Edits\s*$/gi, '智能体编辑'],
      [/^\s*Agent\s+edits\s*$/gi, '智能体编辑'],
      [/^\s*(?:All\s+changes\s+since\s+origin\/master|自\s+origin\/master\s+以来的所有更改)\.?\s*$/gi, '自远程主分支以来的所有更改'],
      [/^\s*(?:All\s+changes\s+since\s+origin\/main|自\s+origin\/main\s+以来的所有更改)\.?\s*$/gi, '自远程主分支以来的所有更改'],
      [/^\s*All\s+changes\s+since\s+(.+?)\.?\s*$/gi, '自 $1 以来的所有更改'],
      [/^\s*All\s+changes\s+since\s*$/gi, '自此以来的所有更改'],
      [/^\s*(?:Branch\s+master|分支\s+master)\s*$/gi, '主分支 (master)'],
      [/^\s*(?:Branch\s+main|分支\s+main)\s*$/gi, '主分支 (main)'],
      [/^\s*(?:Branch\s+(.+?)|分支\s+(.+?))\s*$/gi, '分支 $1$2'],
      [/^\s*Branches\s*$/gi, '分支列表'],
      [/^\s*Staged\s+and\s+working\s+directory\s+changes\.?\s*$/gi, '暂存区更改与工作区更改'],
      [/^\s*Files\s+modified\s+by\s+agent\s+in\s+this\s+conversation\.?\s*$/gi, '智能体在本次对话中修改的文件'],
      
      // 用户截图专项修复 4 处问题 (限额重置倒计时、继承全局权限、Amend追加提交、空白字符差异)
      // 1. 限额重置倒计时 (Resets in 6d 9h / 4h 59m / 完整英文)
      [/^Resets\s+in\s+(\d+)\s*d\s*,?\s*(\d+)\s*h\s*$/gi, '$1 天 $2 小时后重置'],
      [/^Resets\s+in\s+(\d+)\s*h\s*,?\s*(\d+)\s*m\s*$/gi, '$1 小时 $2 分钟后重置'],
      [/^Resets\s+in\s+(\d+)\s*m\s*,?\s*(\d+)\s*s\s*$/gi, '$1 分钟 $2 秒后重置'],
      [/^Resets\s+in\s+(\d+)\s*d\s*$/gi, '$1 天后重置'],
      [/^Resets\s+in\s+(\d+)\s*h\s*$/gi, '$1 小时后重置'],
      [/^Resets\s+in\s+(\d+)\s*m\s*$/gi, '$1 分钟后重置'],
      [/^Resets\s+in\s+(\d+)\s*s\s*$/gi, '$1 秒后重置'],
      [/^Resets\s+in\s+(\d+)\s+days?,?\s*(\d+)\s+hours?\s*$/gi, '$1 天 $2 小时后重置'],
      [/^Resets\s+in\s+(\d+)\s+hours?,?\s*(\d+)\s+minutes?\s*$/gi, '$1 小时 $2 分钟后重置'],
      [/^Resets\s+in\s+(\d+)\s+minutes?,?\s*(\d+)\s+seconds?\s*$/gi, '$1 分钟 $2 秒后重置'],
      [/^Resets\s+in\s+(\d+)\s+days?\s*$/gi, '$1 天后重置'],
      [/^Resets\s+in\s+(\d+)\s+hours?\s*$/gi, '$1 小时后重置'],
      [/^Resets\s+in\s+(\d+)\s+minutes?\s*$/gi, '$1 分钟后重置'],
      [/^Resets\s+in\s+(\d+)\s+seconds?\s*$/gi, '$1 秒后重置'],
      [/^Resets\s+in\s*/gi, '重置倒计时：'],

      // 2. 继承全局权限全容错
      [/^Inherits\s+your\s+(?:global\s+permissions|全局\s*权限)(?:\s*[（(](?:when working in this project|当在此项目中工作时)[）)])?[.。]?\s*$/gi, '继承您的全局权限（当在此项目中工作时）。'],
      [/^Inherits\s+your\s+(?:global\s+permissions|全局\s*权限)(?:\s*[（(](?:when working in this workspace|当在此工作区中工作时)[）)])?[.。]?\s*$/gi, '继承您的全局权限（当在此工作区中工作时）。'],
      [/^Inherits\s+your\s+(?:global\s+permissions|全局\s*权限)[.。]?\s*$/gi, '继承您的全局权限。'],
      [/^Inherits\s+your\s+/gi, '继承您的 '],

      // 3. Git 提交下拉菜单 (Amend)
      [/^Amend$/gi, '修改上次提交'],
      [/^(?:Faileds+tos+Amend|失败s+tos+Amend)/gi, '修改上次提交失败'],
      [/^Faileds+tos+amend/gi, '修改上次提交失败'],
      [/^Faileds+tos+commit/gi, '提交代码失败'],
      [/^Amend\s+Commit$/gi, '修改上次提交'],
      [/^Amend\s+previous\s+commit$/gi, '修改上一次提交'],

      // 4. 差异对比 Whitespace 视图菜单
      [/^(?:Hide|隐藏)\s*Whitespaces*(?:Changes|文件更改)[.。]?$/gi, '隐藏空白字符更改'],
      [/^(?:Show|显示)\s*Whitespace\s*(?:Changes|文件更改)[.。]?$/gi, '显示空白字符更改'],
      [/^Hide\s+Whitespace$/gi, '隐藏空白字符'],
      [/^Show\s+Whitespace$/gi, '显示空白字符'],
      [/^Ignore\s+Whitespace$/gi, '忽略空白字符'],
      [/^Ignore\s+Whitespace\s+Changes$/gi, '忽略空白字符更改'],

      // 危险区域与项目删除动态正则拦截 (彻底根治夹生饭与部分替换冲突)
      [/(?:Permanently\s+delete|永久删除)\s+([^\s]+)\s+including\s+(\d+)\s*(?:active\s+conversations?|活动对话)[.。]?/gi, '永久删除“$1”，包含 $2 个活动对话。'],
      [/Permanently\s+delete\s+([^\s]+)\s+including\s+(\d+)\s*/gi, '永久删除“$1”，包含 $2 个'],
      [/including\s+(\d+)\s*(?:active\s+conversations?|活动对话)[.。]?/gi, '包含 $1 个活动对话。'],
      [/including\s+(\d+)\s*$/gi, '包含 $1 个'],
      [/^Permanently\s+delete\s+(.+)$/gi, '永久删除 $1'],
      [/^Permanently\s+delete$/gi, '永久删除'],
      [/^including$/gi, '包含'],
      [/active\s+conversations?/gi, '活动对话'],
      [/^\s*删除\s+项目\s*$/g, '删除项目'],
      [/^\s*Delete\s+Project\s*$/gi, '删除项目'],
      [/^\s*Delete\s+Workspace\s*$/gi, '删除工作区'],
      [/^\s*删除\s+工作区\s*$/g, '删除工作区'],
      [/^Danger\s+Zone$/gi, '危险区域'],
      [/This\s+action\s+cannot\s+be\s+undone\.?/gi, '此操作无法撤销。'],
      [/^Custom\s+Agents?\s*(\d*)$/gi, '自定义智能体 $1'],
      [/^Plugins?\s*(\d*)$/gi, '插件 $1'],

      // Git 动态提交描述与多段拼接捕获
      [/(?:Commit|提交)\s+(\d+)\s+file\s+changes?\s+to\s*/gi, '提交 $1 项文件更改至 '],
      [/(?:Commit|提交)\s+(\d+)\s+file\s+changes?/gi, '提交 $1 项文件更改'],
      [/(\d+)\s+file\s+changes?\s+to\s*/gi, '$1 项文件更改至 '],
      [/(\d+)\s+file\s+changes?/gi, '$1 项文件更改'],
      [/^file changes to$/gi, '文件更改至'],
      [/^file change to$/gi, '文件更改至'],
      [/^\s*changes to\s*$/gi, '更改至'],
      [/^\s*change to\s*$/gi, '更改至'],

      // Google 官方插件库与扩展说明 (Build with Antigravity / Plugins)
      [/^Build with Antigravity Plugins?$/gi, 'Antigravity 专属扩展插件'],
      [/^Build with Antigravity 插件$/gi, 'Antigravity 专属扩展插件'],
      [/^Build with Google Plugins?$/gi, 'Google 官方扩展插件'],
      [/^Build with Google 插件$/gi, 'Google 官方扩展插件'],
      [/^Build with (.+?) Plugins?$/gi, '$1 专属扩展插件'],
      [/^Build with (.+?) 插件$/gi, '$1 专属扩展插件'],
      [/(?:Plugins|插件)\s+are\s+packaged\s+collections\s+of\s+skills\s+and\s+MCPs\s+to\s+help\s+the\s+Agent(?:\s+in\s+[^.]+?)?\s*work\s+with\s+Google\s+developer\s+products\.\s*You\s+can\s+always\s+change\s+your\s+choices\s+in\s+(?:Settings|设置)\.?/gi, '插件是技能与 MCP 工具的打包集合，可帮助 Antigravity 中的智能体更好地配合 Google 开发者产品工作。您可以随时在“设置”中修改您的选择。'],
      [/are packaged collections of skills and MCPs to help the Agent in Antigravity work with Google developer products\.\s*You can always change your choices in 设置\./gi, '是技能与 MCP 工具的打包集合，可帮助 Antigravity 中的智能体更好地配合 Google 开发者产品工作。您可以随时在“设置”中修改您的选择。'],
      [/There are currently no Build with (.+?) plugins available\./gi, '当前暂无专属扩展插件可用。'],
      [/^There are currently no Build with/gi, '当前暂无可用专属扩展插件'],
      [/^No plugins available\.?$/gi, '暂无可用插件。'],
      [/^Loading plugins\.\.\.$/gi, '正在加载插件...'],
      [/^Refreshing\.\.\.$/gi, '正在刷新...'],
      [/^Refresh$/gi, '刷新'],
      [/Build applications with the Gemini Interactions API and Live API[\s\S]*?(?:streaming\.?|\.\.\.|real[\s\S]*?)?$/gi, '使用 Gemini Interactions API 和 Live API 构建应用，支持文本生成、多轮对话、流式传输、函数调用、托管智能体及实时音视频交互。'],
      [/^Build applications with the Gemini Interactions API and Live API.*/gi, '使用 Gemini Interactions API 和 Live API 构建应用，支持文本生成、多轮对话、流式传输、函数调用、托管智能体及实时音视频交互。'],

      // 复合时间跨度与限额刷新动态翻译 (如: 6 days, 5 hours -> 6 天 5 小时)
      [/(?:Last|最近)\s+(\d+)\s+days?/gi, '最近 $1 天'],
      [/(?:Last|最近)\s+(\d+)\s+hours?/gi, '最近 $1 小时'],
      [/(?:Last|最近)\s+(\d+)\s+minutes?/gi, '最近 $1 分钟'],
      [/(\d+)\s+days?,\s*(\d+)\s+hours?\s*/gi, '$1 天 $2 小时'],
      [/(\d+)\s+hours?,\s*(\d+)\s+minutes?\s*/gi, '$1 小时 $2 分钟'],
      [/(\d+)\s+minutes?,\s*(\d+)\s+seconds?\s*/gi, '$1 分钟 $2 秒'],
      [/(\d+)\s+days?\s*(?=后完全刷新)/gi, '$1 天'],
      [/(\d+)\s+hours?\s*(?=后完全刷新)/gi, '$1 小时'],
      [/(\d+)\s+minutes?\s*(?=后完全刷新)/gi, '$1 分钟'],
      [/(\d+)\s+days?/gi, '$1 天'],
      [/(\d+)\s+hours?/gi, '$1 小时'],
      [/(\d+)\s+minutes?/gi, '$1 分钟'],
      [/(\d+)\s+seconds?/gi, '$1 秒'],
      [/将在\s+([\d\w\s,天小时分钟秒]+?)\s*后完全刷新。/g, (m, p1) => '将在 ' + p1.trim() + '后完全刷新。'],
      [/\s+后完全刷新/g, '后完全刷新'],

      // 模型与用量标题与剩余标签
      // 模型选择菜单与思考强度即时拦截
      [/^Model$/g, '模型'],
      [/^Low$/g, '低'],
      [/^Medium$/g, '中'],
      [/^High$/g, '高'],
      [/(?:\(|（)Thinking(?:\)|）)/gi, '(深度思考)'],
      [/\bGemini 3\.1 Pro Low\b/g, 'Gemini 3.1 Pro 低'],
      [/\bClaude Sonnet 4\.6 \(Thinking\)/g, 'Claude Sonnet 4.6 (深度思考)'],
      [/\bClaude Opus 4\.6 \(Thinking\)/g, 'Claude Opus 4.6 (深度思考)'],
      [/^Models & Usage$/g, '模型与用量'],
      [/^模型 & Usage$/g, '模型与用量'],
      [/^& Usage$/g, '与用量'],
      [/^每周限额\s+Remaining$/g, '每周剩余限额'],
      [/^5小时限额\s+Remaining$/g, '5小时剩余限额'],
      [/^Weekly limit\s+Remaining$/g, '每周剩余限额'],
      [/^5-hour limit\s+Remaining$/g, '5小时剩余限额'],
      [/(\S+)\s+Remaining/g, '$1 剩余'],

      // 浏览器子智能体与说明拆分节点
      // 浏览器远程调试弹窗即时拦截
      [/^Remote Debugging Required$/gi, '需要启用远程调试'],
      [/Navigate to\s+(chrome:\/\/inspect\/#remote-debugging)/gi, '访问 $1'],
      [/(?:Enable|启用)\s*(?:“|")?(?:Allow|允许)?\s*remote debugging for this browser instance(?:”|")?\.?/gi, '启用“允许此浏览器实例的远程调试”。'],
      [/^Continue [Aa]nyway$/gi, '仍然继续'],
      [/^继续 Anyway$/g, '仍然继续'],
      [/^Check [Aa]gain$/gi, '重新检查'],
      [/^\s*to be installed\.?\s*$/gi, '才能使用。'],
      [/^\s*The browser subagent can be invoked by typing \/browser in the conversation input box\.?\s*$/gi, '在对话输入框中输入 /browser 即可调用浏览器子智能体。'],
      [/^\s*to be installed\.\s*The browser subagent can be invoked by typing \/browser in the conversation input box\./gi, '才能使用。在对话输入框中输入 /browser 即可调用浏览器子智能体。'],
      [/It requires Google Chrome to be installed\.\s*The browser subagent can be invoked by typing \/browser in the conversation input box\./gi, '它需要安装 Google Chrome 才能运行。您可以在对话输入框中输入 /browser 来调用浏览器子智能体。'],
      [/配置浏览器子智能体。它需要\s*Google Chrome\s*to be installed\.\s*The browser subagent can be invoked by typing \/browser in the conversation input box\./gi, '配置浏览器子智能体。它需要安装 Google Chrome 才能运行。您可以在对话输入框中输入 /browser 来调用浏览器子智能体。'],

      // MCP 权限确认弹窗专项拦截（彻底消除夹生饭）
      [/(?:Allow|允许)\s+using\s+this\s+MCP\s+(?:tool|工具)\?/gi, '允许使用此 MCP 工具？'],
      [/(?:Allow|允许)\s+using\s+this\s+(?:tool|工具)\?/gi, '允许使用此工具？'],
      [/using this MCP (?:tool|工具)\?/gi, '使用此 MCP 工具？'],
      [/using this MCP/gi, '使用此 MCP'],
      [/(?:Yes|是),\s*and\s+always\s+allow\s+in\s+this\s+conversation/gi, '是，且在此对话中永久允许'],
      [/(?:Yes|是),\s*and\s+always\s+allow\s+in\s+this\s+project/gi, '是，且在此项目中永久允许'],
      [/(?:Yes|是),\s*and\s+always\s+allow\s+in\s+this\s+workspace/gi, '是，且在此工作区中永久允许'],
      [/(?:Yes|是),\s*and\s+always\s+allow/gi, '是，且全局永久允许'],
      [/,\s*and\s+always\s+allow\s+in\s+this\s+conversation/gi, '，且在此对话中永久允许'],
      [/,\s*and\s+always\s+allow\s+in\s+this\s+project/gi, '，且在此项目中永久允许'],
      [/,\s*and\s+always\s+allow\s+in\s+this\s+workspace/gi, '，且在此工作区中永久允许'],
      [/,\s*and\s+always\s+allow/gi, '，且全局永久允许'],
      [/(?:No|否)\s*\((?:tell the agent what to do instead|告知智能体改做什么)\)/gi, '否（告知智能体改做什么）'],
      [/\(tell the agent what to do instead\)/gi, '（告知智能体改做什么）'],
      [/tell the agent what to do instead/gi, '告知智能体改做什么'],

      // 远程控制面板拆分节点
      [/Scan the code to open this device in (?:Remote Control|远程控制),\s*or/gi, '扫描二维码在远程控制中打开此设备，或'],
      [/Scan the code to open this device in/gi, '扫描二维码以在'],
      [/^copy link\.?$/gi, '复制链接'],

      // 快捷键气泡拆分与多平台按键提示
      [/(?:Enter|⏎)\s+Queues after the turn/gi, 'Enter 在本轮对话后排队'],
      [/(?:Enter|⏎)\s+Sends immediately/gi, 'Enter 立即发送'],
      [/(?:Alt\+Enter|⌥⏎)\s+Queues after the turn/gi, 'Alt+Enter 在本轮对话后排队'],
      [/(?:Alt\+Enter|⌥⏎)\s+Sends immediately/gi, 'Alt+Enter 立即发送'],
      [/(?:Alt\+Enter|⌥⏎)\s+On empty prompt,\s*sends next in queue/gi, '提示词为空时按 Alt+Enter 发送队列中的下一条'],

      // 思考耗时与拆分节点
      // ==========================================
      // ==========================================
      // 鼠标悬停浮窗 (Tooltips) 与操作提示全量覆盖
      // ==========================================
      [/^Open in Antigravity IDE$/gi, '在 Antigravity IDE 中打开'],
      [/^Open in IDE$/gi, '在 IDE 中打开'],
      [/^Maximize Pane$/gi, '最大化窗格'],
      [/^Restore Pane$/gi, '还原窗格'],
      [/^Minimize Pane$/gi, '最小化窗格'],
      [/^Close Pane$/gi, '关闭窗格'],
      [/^Toggle Secondary Side Bar$/gi, '切换辅助侧边栏'],
      [/^Toggle Side Bar$/gi, '切换侧边栏'],
      [/^Toggle Terminal$/gi, '切换终端'],
      [/^Toggle Output$/gi, '切换输出'],
      [/^Search Conversations$/gi, '搜索会话'],
      [/^Search tabs, files, plugins, subagents, artifacts, tasks\.\.\.$/gi, '搜索标签页、文件、插件、子智能体、产物、任务...'],
      [/^Search tabs, files, plugins, subagents, arti\.\.\.$/gi, '搜索标签页、文件、插件、子智能体...'],
      [/^Search in files$/gi, '在文件中搜索'],
      [/^Scroll to Bottom$/gi, '滚动至底部'],
      [/^Scroll to Top$/gi, '滚动至顶部'],
      [/^Select model, current:\s*(.+)$/gi, '选择模型，当前：$1'],
      [/^Agent permissions preset selector, current:\s*(.+)$/gi, '智能体权限预设选择器，当前：$1'],
      [/^Send message$/gi, '发送消息'],
      [/^Stop generating$/gi, '停止生成'],
      [/^Attach files?$/gi, '添加附件'],
      [/^Upload image$/gi, '上传图片'],
      [/^Voice input$/gi, '语音输入'],
      [/^Undo to this point$/gi, '撤销至此步骤'],
      [/^Copy message$/gi, '复制消息'],
      [/^Copy code$/gi, '复制代码'],
      [/^Pin conversation$/gi, '置顶对话'],
      [/^Unpin conversation$/gi, '取消置顶对话'],
      [/^Archive conversation$/gi, '归档对话'],
      [/^Delete conversation$/gi, '删除对话'],
      [/^Rename conversation$/gi, '重命名对话'],
      [/^Load older messages, showing (\d+) of (\d+)$/gi, '加载更早消息，显示 $1 / $2'],
      [/^Load older messages$/gi, '加载更早消息'],
      [/^More options$/gi, '更多选项'],
      [/^More actions$/gi, '更多操作'],
      [/^Good response$/gi, '赞同此回答'],
      [/^Bad response$/gi, '不赞同此回答'],
      [/^Regenerate response$/gi, '重新生成回答'],
      [/^Edit message$/gi, '编辑消息'],
      [/^Close tab$/gi, '关闭标签页'],
      [/^Close others$/gi, '关闭其他标签页'],
      [/^Close all$/gi, '关闭全部标签页'],
      [/^Split right$/gi, '向右拆分'],
      [/^Split down$/gi, '向下拆分'],

      // ==========================================
      // 爬虫自动化全量收割补齐规则（步骤/权限/Token/操作）
      // ==========================================
      [/^Compacting\.\.\.$/gi, '正在压缩上下文...'],
      [/^Compacting$/gi, '正在压缩上下文...'],
      [/^Compacted$/gi, '已压缩上下文'],
      [/^Worked\s+for\s+(\d+(?:\.\d+)?)\s*m(?:inutes?)?\s+(\d+(?:\.\d+)?)\s*s(?:econds?)?\.?$/gi, '已工作 $1 分 $2 秒'],
      [/^Worked\s+for\s+(\d+(?:\.\d+)?)\s*m(?:inutes?)?\.?$/gi, '已工作 $1 分钟'],
      [/^Worked\s+for\s+(\d+(?:\.\d+)?)\s*s(?:econds?)?\.?$/gi, '已工作 $1 秒'],
      [/^Worked\s+for\s+a\s+moment\.?$/gi, '已短暂工作'],
      [/^Worked\s+for\s+a\s+few\s+seconds\.?$/gi, '已工作数秒'],
      [/^Worked\s+for\s+a\s+minute\.?$/gi, '已工作 1 分钟'],
      [/^Working\s+for\s+(\d+(?:\.\d+)?)\s*m(?:inutes?)?\s+(\d+(?:\.\d+)?)\s*s(?:econds?)?\.?$/gi, '已工作 $1 分 $2 秒'],
      [/^Working\s+for\s+(\d+(?:\.\d+)?)\s*m(?:inutes?)?\.?$/gi, '已工作 $1 分钟'],
      [/^Working\s+for\s+(\d+(?:\.\d+)?)\s*s(?:econds?)?\.?$/gi, '已工作 $1 秒'],
      [/^Working\s+for\s+a\s+moment\.?$/gi, '正在工作...'],
      [/^Working\.\.\.$/gi, '正在工作...'],
      [/^Edited\s+(.+)$/gi, '已编辑 $1'],
      [/^Editing\s+(.+)$/gi, '正在编辑 $1'],
      [/^Explored\s+files,\s*ran\s+commands?\.?$/gi, '已探索文件并运行命令'],
      [/^(?:(\d+)\.\s*)?Enable\s*(?:“|")?Allow\s+remote\s+debugging\s+for\s+this\s+browser\s+instance(?:”|")?\.?$/gi, '$1. 启用“允许此浏览器实例的远程调试”。'],
      [/^DevTools\s+port\s+is\s+still\s+closed\.\s*Please\s+make\s+sure\s+Chrome\s+is\s+running\s+with\s+remote\s+debugging\s+enabled\.?$/gi, 'DevTools 调试端口仍处于关闭状态。请确保 Chrome 已启用远程调试并正在运行。'],
      [/^Proceed\s+[Aa]nyway$/gi, '仍然继续'],
      [/^Check\s+[Aa]gain$/gi, '重新检查'],
      [/^Tool\s+[Aa]rguments:?$/gi, '工具参数'],
      [/^Tool\s+[Oo]utput:?$/gi, '工具输出'],
      [/^Successfully\s+navigated\s+to\s+(.+)$/gi, '已成功导航至 $1'],
      [/^Copy\s+[Ii]mage$/gi, '复制图片'],
      [/^Save\s+[Ii]mage$/gi, '保存图片'],
      [/^Save\s+[Ii]mage\s+[Aa]s\.\.\.$/gi, '图片另存为...'],
      [/^Copy\s+[Ii]mage\s+[Aa]ddress$/gi, '复制图片地址'],
      [/^Pages:?$/g, '页面'],
      [/^about:blank\s+\[selected\]$/gi, 'about:blank [已选]'],
      [/^\[selected\]$/gi, '[已选]'],
      [/^Analyzed$/gi, '已分析'],
      [/^Analyzing$/gi, '正在分析'],
      [/^Analyzed\s+(.+)$/gi, '已分析 $1'],
      [/^Analyzing\s+(.+)$/gi, '正在分析 $1'],
      [/^Review$/gi, '审查'],
      [/^(\d+)\s+files?\s+changed\s+([+\-0-9\s>]+)$/gi, '已更改 $1 个文件 $2'],
      [/^(\d+)\s+files?\s+changed$/gi, '已更改 $1 个文件'],
      [/^Every command requires approval\.?$/gi, '所有命令均需批准。'],
      [/^Ask before sensitive operations\.?$/gi, '敏感操作前询问。'],
      [/^Run all commands without restrictions\.?$/gi, '无限制运行所有命令。'],
      [/^Search for content to open$/gi, '搜索要打开的内容'],
      [/^Use Global Settings$/gi, '使用全局设置'],
      [/^This project overrides your global permission settings\.?$/gi, '此项目覆盖了您的全局权限设置。'],
      [/^Conversation Log$/gi, '会话日志'],
      [/^User message$/gi, '用户消息'],
      [/^Visit$/gi, '访问'],
      [/^Rules:\s*([\d,]+)\s*tokens?$/gi, '规则：$1 Token'],
      [/^Skills:\s*([\d,]+)\s*tokens?$/gi, '技能：$1 Token'],
      [/^Mcp Tools:\s*([\d,]+)\s*tokens?$/gi, 'MCP 工具：$1 Token'],

      // ==========================================
      // 步骤折叠条动作前缀（动名词/动词大一统）
      // ==========================================
      [/^Testing\s+(.+)$/gi, '正在测试 $1'],
      [/^Injecting\s+(.+)$/gi, '正在注入 $1'],
      [/^Run\s+inspection\s+of\s+(.+)$/gi, '运行检查 $1'],
      [/^Run\s+deep\s+inspect\s+(.+)$/gi, '运行深度检查 $1'],
      [/^Run\s+safe\s+crawler\s+(.+)$/gi, '运行安全爬虫 $1'],
      [/^Run\s+safe\s+crawler$/gi, '运行安全爬虫'],

      // 执行步骤汇总标签（复合与数量全覆盖）
      // ==========================================
      [/^Explored,\s*ran\s+commands,\s*edited\s+files\.?$/gi, '已探索、已运行命令并编辑文件'],
      [/^Explored,\s*ran\s+commands\.?$/gi, '已探索并运行命令'],
      [/^Ran\s+commands,\s*edited\s+files\.?$/gi, '已运行命令并编辑文件'],
      [/^Explored,\s*edited\s+files\.?$/gi, '已探索并编辑文件'],
      [/^Edited\s+files,\s*ran\s+commands\.?$/gi, '已编辑文件并运行命令'],
      [/^Ran\s+commands\.?$/gi, '已运行命令'],
      [/^Edited\s+files\.?$/gi, '已编辑文件'],
      [/^Explored\s+files\.?$/gi, '已探索文件'],
      [/^Explored\s+folders\.?$/gi, '已探索文件夹'],
      [/^Explored\s+folder\.?$/gi, '已探索文件夹'],
      [/^Ran\s+(\d+)\s+commands?\.?$/gi, '已运行 $1 条命令'],
      [/^Edited\s+(\d+)\s+files?\.?$/gi, '已编辑 $1 个文件'],
      [/^Explored\s+(\d+)\s+files?\.?$/gi, '已探索 $1 个文件'],
      [/^Explored\s+(\d+)\s+folders?\.?$/gi, '已探索 $1 个文件夹'],
      [/^Explored\s+(\d+)\s+tasks?\.?$/gi, '已探索 $1 个任务'],
      [/^Explored\s+(\d+)\s+searches?\.?$/gi, '已探索 $1 次搜索'],

            // ==========================================
      // 工具执行步骤动作与状态前缀（严格限定宾语对象，严禁通配用户标题）
      // ==========================================
      [/^Ran\s+command\s+(.+)$/gi, '已运行命令 $1'],
      [/^Running\s+command\s+(.+)$/gi, '正在运行命令 $1'],
      [/^Run\s+command\s+(.+)$/gi, '运行命令 $1'],
      [/^Checked\s+task\s+Execute\s+(.+)$/gi, '检查任务 执行 $1'],
      [/^Writing\s+to\s+file\s+(.+)$/gi, '正在写入文件 $1'],
      [/^Writing\s+file\s+(.+)$/gi, '正在写入文件 $1'],
      [/^Viewing\s+file\s+(.+)$/gi, '正在查看文件 $1'],
      [/^Reading\s+file\s+(.+)$/gi, '正在读取文件 $1'],
      [/^Searching\s+code\s+in\s+(.+)$/gi, '正在 $1 中搜索代码'],
      [/^Searching\s+code\s+(.+)$/gi, '正在搜索代码 $1'],
      [/^Searching\s+the\s+web\s+for\s+(.+)$/gi, '正在网页搜索 $1'],
      [/^Searching\s+the\s+web$/gi, '正在搜索网页'],
      [/^Updating\s+file\s+(.+)$/gi, '正在更新文件 $1'],
      [/^Listing\s+files\s+in\s+(.+)$/gi, '正在列出 $1 中的文件'],
      [/^Fetching\s+content\s+from\s+(.+)$/gi, '正在从 $1 获取内容'],
      [/^Sending\s+message\s+to\s+(.+)$/gi, '正在向 $1 发送消息'],
      [/^Sent\s+message\s+to\s+(.+)$/gi, '已向 $1 发送消息'],
      [/^Killing\s+task\s+(.+)$/gi, '正在终止任务 $1'],
      [/^Killed\s+task\s+(.+)$/gi, '已终止任务 $1'],
      [/^Canceling\s+task\s+(.+)$/gi, '正在取消任务 $1'],
      [/^Canceled\s+task\s+(.+)$/gi, '已取消任务 $1'],
      [/^Launched\s+subagent\s+(.+)$/gi, '已启动子智能体 $1'],
      [/^Launching\s+subagent\s+(.+)$/gi, '正在启动子智能体 $1'],
      [/^Killing\s+task\s+(.+)$/gi, '正在终止任务 $1'],
      [/^Killed\s+task\s+(.+)$/gi, '已终止任务 $1'],
      [/^Canceling\s+task\s+(.+)$/gi, '正在取消任务 $1'],
      [/^Canceled\s+task\s+(.+)$/gi, '已取消任务 $1'],
      [/^Subagent\s+(.+?)\s+finished$/gi, '子智能体 $1 已完成'],
      [/^Subagent\s+(.+?)\s+failed$/gi, '子智能体 $1 失败'],
      [/^Launched\s+subagent\s+(.+)$/gi, '已启动子智能体 $1'],
      [/^Launching\s+subagent\s+(.+)$/gi, '正在启动子智能体 $1'],

      // ==========================================
      // 思考耗时与状态反馈
      // ==========================================
      [/^Thinking for\s*$/g, '已思考 '],
      [/^Thought for\s*$/g, '已思考 '],
      [/^Thought for a moment\.?$/gi, '已短暂思考'],
      [/^Thought for a few seconds\.?$/gi, '已思考数秒'],
      [/^Thinking for a moment\.?$/gi, '正在短暂思考'],
      [/^Thinking\.\.\.$/gi, '正在思考...'],
      [/Thought for (\d+)s/gi, '已思考 $1 秒'],
      [/Thinking for (\d+)s/gi, '已思考 $1 秒'],
      [/思考 for (\d+)s/g, '已思考 $1 秒'],
      [/思考 for (\d+) 秒/g, '已思考 $1 秒'],
      [/已思考 (\d+)s/g, '已思考 $1 秒'],

      // ==========================================
      // 步骤折叠条与差异审查按钮外壳
      // ==========================================
      [/^View changes$/gi, '查看更改'],
      [/^Hide changes$/gi, '隐藏更改'],
      [/^Review changes$/gi, '审查更改'],
      [/^Accept changes$/gi, '接受更改'],
      [/^Reject changes$/gi, '拒绝更改'],
      [/^Revert changes$/gi, '还原更改'],
      [/^Apply changes$/gi, '应用更改'],
      [/^Discard changes$/gi, '放弃更改'],
      [/^Keep changes$/gi, '保留更改'],
      [/^Accept all$/gi, '全部接受'],
      [/^Reject all$/gi, '全部拒绝'],
      [/^Diff view$/gi, '差异视图'],
      [/^Split view$/gi, '分栏视图'],
      [/^Inline view$/gi, '内联视图'],
      [/^Expand all$/gi, '全部展开'],
      [/^Collapse all$/gi, '全部折叠'],
      [/^Copy code$/gi, '复制代码'],
      [/^Run in terminal$/gi, '在终端中运行'],
      [/^Insert into terminal$/gi, '插入终端'],

      // 项目与工作区创建弹窗
      [/^Select Folder\(s\)$/gi, '选择文件夹'],
      [/^Set Project Name$/gi, '设置项目名称'],
      [/^Set Workspace Name$/gi, '设置工作区名称'],
      [/^Enter project name\.\.\.$/gi, '输入项目名称...'],
      [/^Enter workspace name\.\.\.$/gi, '输入工作区名称...'],

      // 状态空值提示（杜绝“否 xxx”）
      [/^No subagents\.?$/gi, '无子智能体'],
      [/^No file changes\.?$/gi, '无文件更改'],
      [/^No remote configured\.?$/gi, '未配置远程仓库'],
      [/^No repositories found\.?$/gi, '未找到代码仓库'],
      [/^No active terminals\.?$/gi, '无活动终端'],
      [/^No branches\.?$/gi, '无分支'],
      [/^No\s*$/g, '否'],
      [/^Yes\s*$/g, '是'],

      // 步骤栏统计项与单位（精准限定在修改前缀下，杜绝误伤）
      // 增强: 修复 Setup may take over 5 分钟 / minutes 夹生饭
      [/Setup may take over (?:(d+)s+minutes?|(d+)s*分钟).?s*Please keep this screen open during setup.?/gi, '设置可能需要超过 $1$2 分钟。在此过程中请保持此屏幕打开。'],
      [/(d+)m ago/gi, '$1 分钟前'],
      [/(d+)s ago/gi, '$1 秒前'],
      [/(d+)h ago/gi, '$1 小时前'],
      [/^(d+)s+tools?$/gi, '$1 个工具'],
      [/^Hides+breakdowns?$/gi, '隐藏明细'],

      // 增强: 登录与欢迎界面
      [/^(?:继续|Continue)\s+with\s+Google$/gi, '通过 Google 账号继续'],
      [/^Send\s+feedback\s+as\s+(.+)$/gi, '以 $1 身份发送反馈'],

      // 增强: 项目与明细统计
      [/^Show\s+(\d+)\s+breakdowns?$/gi, '显示 $1 项明细'],
      [/^(\d+)\s+active\s+conversations?$/gi, '$1 个活跃对话'],
      [/^Weekly\s+Limit\s*(?:剩余)?$/gi, '每周限额剩余'],
      [/^Five\s+Hour\s+Limit\s*(?:剩余)?$/gi, '5 小时限额剩余'],

      // 增强: 修复 Type / and select plan 碎片与半汉化
      [/^(?:类型|Type)\s*$/g, '输入'],
      [/^\s*and select\s*$/gi, '并选择'],
      [/^\s*to have the agent generate a plan\.?\s*$/gi, '以让智能体生成计划。'],
      [/(?:类型|Type)\s*(\/|／)\s*(?:and select|并选择)\s*plan\s*(?:to have the agent generate a plan\.?|以让智能体生成计划。)/gi, '输入 $1 并选择 plan 以让智能体生成计划。'],
      [/^类型\s*(\/|／)\s*and select plan to have the agent generate a plan\.?$/gi, '输入 $1 并选择 plan 以让智能体生成计划。'],
      [/^Type\s*(\/|／)\s*and select plan to have the agent generate a plan\.?$/gi, '输入 $1 并选择 plan 以让智能体生成计划。'],

      // 增强: Modified in 项目名
      [/^Modified in\s*$/g, '已在项目内修改：'],
      [/(?:Modified in|已在)\s*([A-Za-z0-9_\-\u4e00-\u9fa5]+)\s*$/gi, '已在 $1 中修改'],
      [/^Modified in\s+([A-Za-z0-9_\-\u4e00-\u9fa5]+)\s*$/gi, '已在 $1 中修改'],

      [/^Modified in\s*$/g, '已在'],
      [/(?:Modified in|已在)\s*(\d+)\s+projects?/gi, '已在 $1 个项目中修改'],
      [/Inherit\s*常规/g, '继承常规设置'],
      [/^Inherit$/g, '继承'],
      [/Notification\s*设置/g, '通知设置'],
      [/^Automatic 检查更新$/g, '自动检查更新'],
      [/^否 MCP servers installed$/g, '未安装任何 MCP 服务器'],
      [/Manage (.+) folders, agent settings, and permissions\./gi, '管理项目文件夹、智能体设置和权限。'],
      [/See all \((\d+)\)/gi, '查看全部 ($1)'],
      [/^See all$/gi, '查看全部'],
      [/^Commit$/g, '提交'],
      [/^Agent Edits$/g, '智能体编辑'],
      [/了解更多 about/g, '了解关于'],
      [/Learn more about/gi, '了解关于'],
      [/Explored (\d+) folders?/gi, '已探索 $1 个文件夹'],
      [/已探索 (\d+) folders?/g, '已探索 $1 个文件夹'],
      [/Ran (\d+) commands?/gi, '已运行 $1 条命令'],
      [/已运行 (\d+) commands?/g, '已运行 $1 条命令'],
      [/Explored (\d+) tasks?/gi, '已探索 $1 个任务'],
      [/已探索 (\d+) tasks?/g, '已探索 $1 个任务'],
      [/Explored (\d+) files?/gi, '已探索 $1 个文件'],
      [/已探索 (\d+) files?/g, '已探索 $1 个文件'],
      [/Explored (\d+) searches?/gi, '已探索 $1 次搜索'],
      [/已探索 (\d+) searches?/g, '已探索 $1 次搜索'],
      [/(\d+) agents running/gi, '$1 个智能体正在运行'],
      [/1 agent running/gi, '1 个智能体正在运行'],

      // 动态应用设置标题
      [/Manage (.+) app settings\./gi, '管理 $1 应用设置。'],
      [/管理 (.+) app settings\./g, '管理 $1 应用设置。'],

      // 相对时间与耗时
      [/(\d+) seconds? ago/gi, '$1 秒前'],
      [/(\d+) minutes? ago/gi, '$1 分钟前'],
      [/(\d+) hours? ago/gi, '$1 小时前'],
      [/(\d+) days? ago/gi, '$1 天前'],
      [/Worked for (\d+)s/gi, '已工作 $1 秒'],
      [/Worked for (\d+)m/gi, '已工作 $1 分钟'],
      [/Refreshes in (\d+) hours?, (\d+) minutes?/gi, '$1 小时 $2 分钟后刷新'],
      [/Refreshes in (\d+) minutes?/gi, '$1 分钟后刷新'],
      [/Refreshes in (\d+) hours?/gi, '$1 小时后刷新'],

      // ==========================================
      // 动态限额与用量多时序自适应大一统规则
      // ==========================================
      [/^Weekly\s+Limit(?:\s+(?:Remaining|剩余))?$/gi, '每周限额剩余'],
      [/^Five\s+Hour\s+Limit(?:\s+(?:Remaining|剩余))?$/gi, '5 小时限额剩余'],
      [/^5-Hour\s+Limit(?:\s+(?:Remaining|剩余))?$/gi, '5 小时限额剩余'],
      [/^5\s+Hour\s+Limit(?:\s+(?:Remaining|剩余))?$/gi, '5 小时限额剩余'],
      [/^Weekly\s+Limit$/gi, '每周限额'],
      [/^Five\s+Hour\s+Limit$/gi, '5 小时限额'],
      [/^View\s+Usage$/gi, '查看用量'],
      [/^Notice$/gi, '说明'],
      [/^Unavailable$/gi, '暂不可用'],
      [/^(\d+)\s+files?\s+changed\s+([+\-0-9\s>]+)$/gi, '已更改 $1 个文件 $2'],
      [/^(\d+)\s+files?\s+changed$/gi, '已更改 $1 个文件'],
      [/You have used some of your\s+(?:weekly limit|每周限额),?\s*it will fully refresh in\s*([^.]+?)(?:\.|\$)/gi, '您已使用部分每周限额，将在 $1后完全刷新。'],
      [/You have used some of your\s+(?:5-hour limit|5 hour limit|5小时限额|5 小时限额),?\s*it will fully refresh in\s*([^.]+?)(?:\.|\$)/gi, '您已使用部分 5 小时限额，将在 $1后完全刷新。'],
      [/You have used some of your\s+(.+?),?\s*it will fully refresh in\s*([^.]+?)(?:\.|\$)/gi, '您已使用部分 $1，将在 $2后完全刷新。'],
      [/(\d+)% of the customization budget is available\./gi, '自定义预算还剩 $1%。'],
      [/Your Plan: (.+)/gi, '您的套餐：$1'],

      // 修复半拼接残留项
      [/^\+\s*New 对话$/g, '+ 新建对话'],
      [/^Not in 项目$/g, '未在项目中'],
      [/^Provide 反馈$/g, '提供反馈'],
      [/^对话 Width$/g, '对话宽度'],
      [/^应用 version$/g, '应用版本'],
      [/^浏览器 settings have moved$/g, '浏览器设置已迁移'],

      // 对话历史条目右键/三点菜单与二级子菜单高优先级匹配
      [/^Mark\s+Unread$/gi, '标为未读'],
      [/^Mark\s+Read$/gi, '标为已读'],
      [/^Mark\s+as\s+Unread$/gi, '标记为未读'],
      [/^Mark\s+as\s+Read$/gi, '标记为已读'],
      [/^Mark\s+as\s+unread$/gi, '标记为未读'],
      [/^Mark\s+as\s+read$/gi, '标记为已读'],
      [/^Mark\s+all\s+as\s+read$/gi, '全部标记为已读'],
      [/^Mark\s+1\s+conversation\s+as\s+read$/gi, '将 1 个对话标记为已读'],
      [/^Mark\s+all\s+(\d+)\s+conversations\s+as\s+read$/gi, '将全部 $1 个对话标记为已读'],
      [/^Split$/gi, '拆分窗格'],
      [/^Split\s+Right$/gi, '向右拆分'],
      [/^Split\s+Down$/gi, '向下拆分'],
      [/^Split\s+Up$/gi, '向上拆分'],
      [/^Split\s+Left$/gi, '向左拆分'],
      [/^Split\s+Editor$/gi, '拆分编辑器'],
      [/^Split\s+Conversation\s+Horizontally$/gi, '水平拆分对话'],
      [/^Split\s+Conversation\s+Vertically$/gi, '垂直拆分对话'],
      [/^Split\s+Terminal$/gi, '拆分终端'],
      [/^Equalize\s+Split\s+Panes$/gi, '等分拆分窗格'],
      [/^Remove\s+From\s+Split$/gi, '从拆分中移除'],
      [/^Replace\s+With\s+New$/gi, '替换为新建'],
      [/^Restore\s+split\s+view$/gi, '恢复拆分视图'],
      [/^Close\s+split\s+view\s+and\s+go\s+to\s+forked\s+conversation$/gi, '关闭拆分视图并前往分支对话'],
      [/^Move\s+to\.\.\.$/gi, '移动到...'],
      [/^Move\s+to\s+New\s+Window$/gi, '移动到新窗口'],
      [/^Move\s+to\s+Opposite\s+Group$/gi, '移动到对侧分组'],
      [/^Move\s+to\s+Previous\s+Group$/gi, '移动到上一分组'],
      [/^Move\s+to\s+Next\s+Group$/gi, '移动到下一分组'],
      [/^Move\s+Right$/gi, '向右移动'],
      [/^Move\s+Down$/gi, '向下移动'],
      [/^Move\s+Up$/gi, '向上移动'],
      [/^Move\s+Left$/gi, '向左移动'],
      [/^Move\s+to\s+Group$/gi, '移动到分组'],
      [/^New\s+Group$/gi, '新建分组'],
      [/^Remove\s+from\s+Group$/gi, '从分组中移除'],
      [/^No\s+groups\s+yet$/gi, '暂无分组'],
      [/^No\s+groups$/gi, '暂无分组'],
      [/^A\s+group\s+with\s+this\s+name\s+already\s+exists\.?$/gi, '已存在同名分组。'],
      [/^Group\s+name$/gi, '分组名称'],
      [/^Create\s+Group$/gi, '创建分组'],
      [/^Conversation\s+Name$/gi, '对话名称'],
      [/^Conversation\s+ID$/gi, '对话 ID'],
      [/^Workspace\s+Name$/gi, '工作区名称'],
      [/^Worktree\s+Name$/gi, '工作树名称'],
      [/^Project\s+Name$/gi, '项目名称'],
      [/^Fork$/gi, '创建分支'],
      [/^Create\s+fork\s+in\s+current\s+workspace$/gi, '在当前工作区中创建分支'],
      [/^Create\s+fork\s+in\s+shared\s+workspace$/gi, '在共享工作区中创建分支'],
      [/^Create\s+fork\s+in\s+new\s+workspace$/gi, '在新工作区中创建分支'],
      [/^Creating\s+worktree\s+for\s+the\s+forked\s+conversation\.\.\.$/gi, '正在为分支对话创建工作树...'],
      [/^Creating\s+CitC\s+workspace\s+for\s+the\s+forked\s+conversation\.\.\.$/gi, '正在为分支对话创建 CitC 工作区...'],
      [/^Are\s+you\s+sure\s+you\s+want\s+to\s+delete\s+this\s+conversation\?\s*This\s+action\s+cannot\s+be\s+undone\.?$/gi, '您确定要删除此对话吗？此操作无法撤消。'],
      [/^Delete\s+Permanently$/gi, '永久删除'],
      [/^Delete\s+Conversation$/gi, '删除对话'],
      [/^Archive\s+this\s+conversation$/gi, '归档此对话'],
      [/^Unarchive$/gi, '取消归档'],
      [/^Unpin$/gi, '取消置顶'],
      [/^Pin$/gi, '置顶'],
      [/^Stop$/gi, '停止'],
      [/^Rename$/gi, '重命名'],
      [/^Delete$/gi, '删除'],
      [/^Restore$/gi, '恢复'],
      [/^Share$/gi, '分享'],
      [/^View\s+Debug$/gi, '查看调试信息'],
      [/^View\s+Debug\s+Info$/gi, '查看调试信息'],

      // 右侧栏 Tabs、状态与条目标签
      [/^Artifacts\s*\(\s*(\d+)\s+Files?\s+for\s+Conversation\s*\)$/gi, '产物文件 (本对话包含 $1 个文件)'],
      [/^Artifacts\s*\(\s*(\d+)\s+Files?\s*\)$/gi, '产物文件 ($1 个文件)'],
      [/^Artifacts\s*\(\s*(\d+)\s*\)$/gi, '产物文件 ($1)'],
      [/^Subagents\s*\(\s*(\d+)\s*\)$/gi, '子智能体 ($1)'],
      [/^Subagents\s*\(/gi, '子智能体 ('],
      [/^Subagent\s*\(/gi, '子智能体 ('],
      [/^Debug\s*\(\s*Enabled\s*\)$/gi, '调试模式 (已启用)'],
      [/^Debug\s*\(\s*Disabled\s*\)$/gi, '调试模式 (已禁用)'],
      [/^Debug\s+Mode\s+Enabled$/gi, '调试模式已启用'],
      [/^Debug\s+Mode\s+Disabled$/gi, '调试模式已禁用'],
      [/^No\s+trajectory$/gi, '无轨迹记录'],
      [/^Generation\s+Steps\s*\(\s*(\d+)\s*\)$/gi, '生成步骤 ($1)'],
      [/^Steps\s*\(\s*(\d+)\s*\)$/gi, '执行步骤 ($1)'],
      [/^Message\s+History\s*\(\s*(\d+)\s*\)$/gi, '消息历史 ($1)'],

      // 右侧栏全类型文件与相对时间复合标签正则匹配 (Media / Screenshot / Image / Recording / Video / Diff 等)
      [/^(Media|Screenshot|Image|Audio|Recording|Video|Diagram|Flowchart|Mockup|Design|Document|Notes|Note|Plan|Summary|Task|Diff|Preview|Report|Output|Data|Test|Log|Trace|Snapshot|Artifacts?|Scratchpad|Steps?)\s*\((.+?)\)$/gi, (match, prefix, timePart) => {
        const prefixMap = {
          Media: '媒体文件',
          Screenshot: '屏幕截图',
          Image: '图片文件',
          Audio: '音频文件',
          Recording: '录制文件',
          Video: '视频文件',
          Diagram: '图表文件',
          Flowchart: '流程图',
          Mockup: '原型设计',
          Design: '设计文件',
          Document: '文档文件',
          Notes: '笔记便签',
          Note: '笔记便签',
          Plan: '计划规划',
          Summary: '总结摘要',
          Task: '任务文件',
          Diff: '差异对比',
          Preview: '预览文件',
          Report: '报告文件',
          Output: '输出产物',
          Data: '数据文件',
          Test: '测试文件',
          Log: '日志文件',
          Trace: '追踪记录',
          Snapshot: '快照文件',
          Artifact: '产物文件',
          Artifacts: '产物文件',
          Scratchpad: '便签草稿',
          Steps: '执行步骤',
          Step: '执行步骤'
        };
        const zhPrefix = prefixMap[prefix] || prefix;
        let zhTime = timePart;
        zhTime = zhTime.replace(/^(?:Today|今天)\s+(\d{1,2}:\d{2})\s*AM$/i, '今天 上午 $1')
                       .replace(/^(?:Today|今天)\s+(\d{1,2}:\d{2})\s*PM$/i, '今天 下午 $1')
                       .replace(/^(?:Yesterday|昨天)\s+(\d{1,2}:\d{2})\s*AM$/i, '昨天 上午 $1')
                       .replace(/^(?:Yesterday|昨天)\s+(\d{1,2}:\d{2})\s*PM$/i, '昨天 下午 $1')
                       .replace(/^(?:Today|今天)\s+at\s+(\d{1,2}:\d{2})\s*AM$/i, '今天 上午 $1')
                       .replace(/^(?:Today|今天)\s+at\s+(\d{1,2}:\d{2})\s*PM$/i, '今天 下午 $1')
                       .replace(/^(?:Yesterday|昨天)\s+at\s+(\d{1,2}:\d{2})\s*AM$/i, '昨天 上午 $1')
                       .replace(/^(?:Yesterday|昨天)\s+at\s+(\d{1,2}:\d{2})\s*PM$/i, '昨天 下午 $1')
                       .replace(/^(?:Today|今天)\s+(\d{1,2}:\d{2})$/i, '今天 $1')
                       .replace(/^(?:Yesterday|昨天)\s+(\d{1,2}:\d{2})$/i, '昨天 $1')
                       .replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})(?:,\s*(\d{4}))?\s+(?:(AM|PM|上午|下午)\s*)?(\d{1,2}:\d{2})\s*(AM|PM)?/gi, (m, mon, day, yr, ap1, time, ap2) => {
                         const monMap = { Jan: '1', Feb: '2', Mar: '3', Apr: '4', May: '5', Jun: '6', Jul: '7', Aug: '8', Sep: '9', Oct: '10', Nov: '11', Dec: '12' };
                         const mo = monMap[mon] || mon;
                         const ap = ap1 || ap2;
                         let p = '';
                         if (ap) {
                           p = (ap.toUpperCase() === 'AM' || ap === '上午') ? '上午 ' : '下午 ';
                         }
                         return yr ? `${yr}年${mo}月${day}日 ${p}${time}`.trim() : `${mo}月${day}日 ${p}${time}`.trim();
                       });
        return `${zhPrefix} (${zhTime})`;
      }],

      // 右侧栏散落的相对时间单独模式
      [/^Media\s*\(/gi, '媒体文件 ('],
      [/^Artifacts?\s*\(/gi, '产物文件 ('],
      [/^Scratchpad\s*\(/gi, '便签草稿 ('],
      [/^Steps\s*\(/gi, '执行步骤 ('],
      [/\((?:Today|今天)\s+(\d{1,2}:\d{2})\s*AM\)/gi, '(今天 上午 $1)'],
      [/\((?:Today|今天)\s+(\d{1,2}:\d{2})\s*PM\)/gi, '(今天 下午 $1)'],
      [/\((?:Yesterday|昨天)\s+(\d{1,2}:\d{2})\s*AM\)/gi, '(昨天 上午 $1)'],
      [/\((?:Yesterday|昨天)\s+(\d{1,2}:\d{2})\s*PM\)/gi, '(昨天 下午 $1)'],
      [/\((?:Today|今天)\s+(\d{1,2}:\d{2})\)/gi, '(今天 $1)'],
      [/\((?:Yesterday|昨天)\s+(\d{1,2}:\d{2})\)/gi, '(昨天 $1)'],
      [/(?:^|\b)(?:today|Today)\s+at\s+(\d{1,2}:\d{2})\s*AM\b/gi, '今天 上午 $1'],
      [/(?:^|\b)(?:today|Today)\s+at\s+(\d{1,2}:\d{2})\s*PM\b/gi, '今天 下午 $1'],
      [/(?:^|\b)(?:yesterday|Yesterday)\s+at\s+(\d{1,2}:\d{2})\s*AM\b/gi, '昨天 上午 $1'],
      [/(?:^|\b)(?:yesterday|Yesterday)\s+at\s+(\d{1,2}:\d{2})\s*PM\b/gi, '昨天 下午 $1'],
      [/(?:^|\b)(?:tomorrow|Tomorrow)\s+at\s+(\d{1,2}:\d{2})\s*AM\b/gi, '明天 上午 $1'],
      [/(?:^|\b)(?:tomorrow|Tomorrow)\s+at\s+(\d{1,2}:\d{2})\s*PM\b/gi, '明天 下午 $1'],
      [/(?:^|\b)(?:today|Today)\s+at\s+(\d{1,2}:\d{2})\b/gi, '今天 $1'],
      [/(?:^|\b)(?:yesterday|Yesterday)\s+at\s+(\d{1,2}:\d{2})\b/gi, '昨天 $1'],
      [/(?:^|\b)(?:tomorrow|Tomorrow)\s+at\s+(\d{1,2}:\d{2})\b/gi, '明天 $1'],
      [/(?:^|\b)(?:Today|今天)\s+(\d{1,2}:\d{2})\s*AM\b/gi, '今天 上午 $1'],
      [/(?:^|\b)(?:Today|今天)\s+(\d{1,2}:\d{2})\s*PM\b/gi, '今天 下午 $1'],
      [/(?:^|\b)(?:Yesterday|昨天)\s+(\d{1,2}:\d{2})\s*AM\b/gi, '昨天 上午 $1'],
      [/(?:^|\b)(?:Yesterday|昨天)\s+(\d{1,2}:\d{2})\s*PM\b/gi, '昨天 下午 $1'],
      // 月份英文格式化 (如 Oct 24, 2026 10:30 AM 或 Oct 24 10:30 AM)
      [/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})(?:,\s*(\d{4}))?\s+(?:(AM|PM|上午|下午)\s*)?(\d{1,2}:\d{2})\s*(AM|PM)?/gi, (m, mon, day, yr, ap1, time, ap2) => {
        const monMap = { Jan: '1', Feb: '2', Mar: '3', Apr: '4', May: '5', Jun: '6', Jul: '7', Aug: '8', Sep: '9', Oct: '10', Nov: '11', Dec: '12' };
        const mo = monMap[mon] || mon;
        const ap = ap1 || ap2;
        let p = '';
        if (ap) {
          p = (ap.toUpperCase() === 'AM' || ap === '上午') ? '上午 ' : '下午 ';
        }
        return yr ? `${yr}年${mo}月${day}日 ${p}${time}`.trim() : `${mo}月${day}日 ${p}${time}`.trim();
      }],
      [/(?:^|\b)(\d{1,2}:\d{2})\s*AM\b/g, '上午 $1'],
      [/(?:^|\b)(\d{1,2}:\d{2})\s*PM\b/g, '下午 $1'],
      [/(?:^|\b)last\s+([a-zA-Z]+)\s+at\s+(\d{1,2}:\d{2})\s*(AM|PM)?/gi, (m, day, time, ap) => {
        const dayMap = { monday: '周一', tuesday: '周二', wednesday: '周三', thursday: '周四', friday: '周五', saturday: '周六', sunday: '周日' };
        const d = dayMap[day.toLowerCase()] || day;
        const p = ap ? (ap.toUpperCase() === 'AM' ? '上午 ' : '下午 ') : '';
        return `上${d} ${p}${time}`.trim();
      }],

      // 自动化与自定义卡片精准匹配与弹性容错
      [/^Create with Prompt$/gi, '通过提示词创建'],
      [/^\+\s*New$/gi, '+ 新建'],
      [/^Search automations\.\.\.$/gi, '搜索自动化任务...'],
      [/^No automations configured\.?$/gi, '未配置任何自动化任务。'],
      [/^No automations found\.?$/gi, '未找到任何自动化任务。'],
      [/^Automations$/gi, '自动化'],
      [/^Automate recurring workflows with scheduled tasks\.?$/gi, '通过定时任务实现重复性工作流的自动化。'],
      [/^Create an automation to get started\.?$/gi, '创建一个自动化任务以开始使用。'],
      [/^Last run$/gi, '上次运行'],
      [/^Next run$/gi, '下次运行'],
      [/^Runs every$/gi, '执行周期'],
      [/^Search,\s*upload,\s*download,\s*and\s*share\s*files\.?$/gi, '搜索、上传、下载与共享文件。'],
      [/^Prototype,\s*build\s*&\s*run\s*modern\s*apps\s*that\s*users?\s*love.*?$/gi, '利用 Google Cloud 原型设计、构建并运行深受用户喜爱的现代应用程序。'],
      [/^Prototype,\s*build\s*&\s*run\s*modern\s*apps\s*that\s*user.*?$/gi, '利用 Google Cloud 原型设计、构建并运行现代应用程序...'],
      [/^Curated\s*collection\s*of\s*agent\s*skills\s*for\s*science.*?$/gi, '面向科学任务精选的智能体技能合集，加速科研发现。'],
      [/^Curated\s*collection\s*of\s*modern\s*fullstack\s*web\s*dev\s*agent\s*skills\.?$/gi, '精选的现代 Web 全栈开发智能体技能合集。'],
      [/^Automate,\s*inspect,\s*and\s*debug\s*with\s*Chrome\s*DevTools\s*and\s*Puppeteer\.?$/gi, '使用 Chrome DevTools 和 Puppeteer 执行自动化操作、页面审查与深度调试。'],
      [/^Build\s*powerful\s*autonomous\s*AI\s*agents\s*with\s*the\s*Google\s*Antigravity\s*Python\s*SDK\.?$/gi, '使用 Google Antigravity Python SDK 构建强大的自主 AI 智能体。']
    ];

    function escapeRegExp(value) {
      return value.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
    }

    function replacePhrase(value, source, target) {
      const escaped = escapeRegExp(source);
      const startsWord = /^[A-Za-z0-9]/.test(source);
      const endsWord = /[A-Za-z0-9]$/.test(source);
      const pattern = new RegExp((startsWord ? '(?<![A-Za-z0-9_])' : '') + escaped + (endsWord ? '(?![A-Za-z0-9_])' : ''), 'g');
      return value.replace(pattern, target);
    }

    function translate(value) {
      if (!value || typeof value !== 'string') return value;
      if (!/[A-Za-z]/.test(value)) return value;

      // 绝对系统路径保护：杜绝将 AppData\Local 或绝对路径中的单词乱替换
      if (/[a-zA-Z]:[\\\/]|\/Users\/|\\Users\\|node_modules|AppData[\\\/]Local/i.test(value)) {
        return value.replace(/^Analyzed\s+/i, '已分析 ')
                    .replace(/^Analyzing\s+/i, '正在分析 ')
                    .replace(/^Canceled\s+/i, '已取消 ')
                    .replace(/^Ran\s+/i, '已运行 ')
                    .replace(/^Edited\s+/i, '已编辑 ')
                    .replace(/^Editing\s+/i, '正在编辑 ');
      }

      // 提取前导与尾随空白字符，保持原生排版与换行格式
      const match = value.match(/^(\s*)([\s\S]*?)(\s*)$/);
      if (!match) return value;
      const leading = match[1];
      const core = match[2];
      const trailing = match[3];

      // 0. 用户个性化自定义词典最高优先级覆盖 (User Custom Dictionary Override)
      if (USER_CUSTOM_MAP.has(core)) {
        return leading + USER_CUSTOM_MAP.get(core) + trailing;
      }

      // 1. O(1) 绝对精准哈希匹配（全句/全词完全相等才替换，绝不从长句中抠字，绝不跨区域污染）
      if (EXACT_MAP.has(core)) {
        return leading + EXACT_MAP.get(core) + trailing;
      }

      // 2. 极少数动态数字/状态模式（带严格 ^ 和 $ 边界硬锁）
      for (let i = 0; i < patterns.length; i++) {
        const p = patterns[i][0];
        const r = patterns[i][1];
        if (p.test(core)) {
          const res = core.replace(p, r);
          p.lastIndex = 0;
          return leading + res + trailing;
        }
      }

      // 3. 未命中整句规则则严格原样返回，绝对严禁用 includes 子串切割造成夹生饭！
      return value;
    }

            // ========================================================================
    // 【极致性能 V3】四大降维优化引擎 (Zero-Lag Ultra-Fast Engine)
    // 1. 父子包含去重 2. 正文父级瞬时 FILTER_REJECT 硬剪枝 3. 6ms 时间切片防掉帧 4. 节点染色防重搜
    // 彻底根除超长历史对话加载时的 2~3 秒主线程阻塞卡顿，秒开性能与官方英文版完全持平！
    // ========================================================================

    function shouldSkip(node) {
      if (!node) return true;

      // 【核心系统元数据/状态时间标签放行白名单】
      if (node.nodeType === Node.TEXT_NODE && node.nodeValue) {
        const nv = node.nodeValue.trim();
        if (/^(\d+\s*[smhdw]|1mo|\d+mo|\d+y|just now)\s+ago$/i.test(nv) || /^Worked for\s+\d+/i.test(nv) || nv === 'Prompt Draft' || nv === 'Running' || nv === 'Copy' || nv === 'Rename' || nv === 'Delete') {
          return false;
        }
      }

      const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
      if (!element) return false;

      // 1. 0 毫秒极速标签跳过 (无需任何复杂选择器查询)
      const tagName = element.tagName ? element.tagName.toLowerCase() : '';
      if (tagName === 'svg' || tagName === 'path' || tagName === 'code' || tagName === 'pre' || tagName === 'script' || tagName === 'style' || tagName === 'canvas') {
        return true;
      }

      // 2. 染色标记极速跳过 (已跳过的容器全局 O(1) 瞬时拦截)
      if (element.__zh_skip === true) return true;

      // 3. 核心代码块、终端、正文容器（单点快速匹配，直接整树剪枝）
      // 3. 核心代码块、终端、用户正文容器、右侧文档预览分栏（在最顶层单点快速匹配，直接整树硬剪枝，杜绝数万节点爬行）
      if (element.matches && element.matches('.monaco-editor, .terminal, .xterm, .markdown-body, [data-testid="user-input-step"], [contenteditable="true"], [data-testid*="preview"], [data-testid*="markdown"], [data-testid*="file-viewer"], .editor-container, .preview-container, .markdown-preview, .artifact-viewer, .artifact-view, .artifact-drawer, .prose, article')) {
        element.__zh_skip = true;
        return true;
      }
      if (element.closest('.monaco-editor, .monaco-mouse-cursor-text, .cursor-edit, .terminal, .xterm, pre, code, [data-testid*="preview"], [data-testid*="markdown"], [data-testid*="file-viewer"], .editor-container, .preview-container, .markdown-preview, .artifact-viewer, .artifact-view, .artifact-drawer, .prose, article')) {
        if (!element.closest('button, [role="button"], .review-button')) {
          element.__zh_skip = true;
          return true;
        }
      }

      // 4. 【核心用户数据免触区】左侧会话历史列表条目、历史记录弹窗条目、用户会话标题 100% 绝对跳过！
      if (element.closest('[data-testid*="conversation-row"], [data-testid*="history-item"], [data-testid*="session-item"]')) {
        if (!element.closest('button, [role="button"], [role="menu"], [role="menuitem"], [role="dialog"]')) {
          return true;
        }
      }

      // 5. 保护用户技术文档、产物抽屉与大型 Markdown 正文 (父级直接拦截)
      if (element.closest('.markdown-body, .markdown-content, [data-testid*="markdown"], [data-testid*="artifact"], .artifact-viewer, .artifact-view, .artifact-drawer, .prose, article')) {
        if (!element.closest('.artifact-card, button, [role="button"], .review-button')) {
          element.__zh_skip = true;
          return true;
        }
      }

      // 6. 保护正在输入的文本域与编辑框
      if (element.closest('[contenteditable="true"], [contenteditable=""], input, textarea')) {
        return true;
      }

      // 7. 保护登录认证与向导区域
      if (element.closest('[data-testid="login-container"], [data-testid="welcome-screen"], .login-screen, [data-testid="ide-install-wizard"]')) {
        return true;
      }

      // 8. 保护用户提问气泡与超长消息流正文 (关键：父级 FILTER_REJECT 硬剪枝)
      if (element.closest('[data-testid="user-input-step"], [aria-label="User message"], [aria-label="用户消息"]')) {
        element.__zh_skip = true;
        return true;
      }
      if (element.closest('[data-testid*="chat-message"], [data-testid*="turn"], [data-testid*="step"], [role="log"]')) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (element.matches && element.matches('.markdown-body, pre, code, .terminal, .monaco-editor, [data-testid="user-input-step"]')) {
            element.__zh_skip = true;
            return true;
          }
          // 如果当前元素已经处于只读正文容器内部，直接阻断
          if (element.parentElement && element.parentElement.__zh_skip === true) {
            element.__zh_skip = true;
            return true;
          }
          return false;
        }

        // 文本节点：仅放行步骤条折叠头、审查栏与控制按钮
        if (element.closest('button, [role="button"], .files-changed-header, .review-button, [class*="min-h-8"], [class*="select-none"], [data-testid*="collapsible"], [data-testid*="compact"], [data-testid*="step"] > div:first-child')) {
          if (!element.closest('.monaco-editor, .terminal, .xterm, pre, code')) {
            return false;
          }
        }
        return true;
      }

      // 9. 【核心交互组件白名单放行】
      if (element.closest('[data-mention-menu], [role="listbox"], [role="menu"], [role="dialog"], [role="tooltip"], [role="combobox"], [role="option"], .files-changed-header, .review-button, p.pointer-events-none, [data-placeholder], button, [role="button"], [data-testid*="collapsible"], [data-testid*="compact"], [data-radix-popper-content-wrapper], [data-radix-menu-content], [role="menuitem"], [class*="context-menu"]')) {
        return false;
      }

      return false;
    }

    function translateElement(element) {
      try {
        if (!element || !element.hasAttributes || !element.hasAttributes()) return;
        const attrs = ['aria-label', 'title', 'placeholder', 'alt'];
        for (let i = 0; i < attrs.length; i++) {
          const attr = attrs[i];
          if (!element.hasAttribute(attr)) continue;
          const value = element.getAttribute(attr);
          if (!value || !/[A-Za-z]/.test(value)) continue;
          if (element.__zh_last_attr_val && element.__zh_last_attr_val[attr] === value) continue;
          const translated = translate(value);
          if (translated !== value) {
            element.setAttribute(attr, translated);
            if (!element.__zh_last_attr_val) element.__zh_last_attr_val = {};
            element.__zh_last_attr_val[attr] = translated;
          }
        }
      } catch (e) {}
    }

    function checkCompositeElement(el) {
      try {
        if (!el || el.children.length > 0) return;
        const tc = el.textContent;
        if (tc && tc.indexOf('file change') !== -1) {
          const fixed = tc.replace(/(?:Commit|提交)\s+(\d+)\s+file\s+changes?\s+to/i, '提交 $1 项文件更改至');
          if (el.textContent !== fixed) {
            el.textContent = fixed;
            el.__zh_patched = true;
          }
        }
      } catch (e) {}
    }

    function translateNode(root) {
      try {
        if (!root || shouldSkip(root)) return;

        // 文本节点快速翻译与记忆
        if (root.nodeType === Node.TEXT_NODE) {
          const val = root.nodeValue;
          if (val && /[A-Za-z]/.test(val)) {
            if (root.__zh_done && root.__zh_last_val === val) {
              return;
            }
            const translated = translate(val);
            if (translated !== val) {
              root.nodeValue = translated;
              root.__zh_last_val = translated;
              if (!/[A-Za-z]/.test(translated)) {
                root.__zh_done = true;
              }
            }
          }
          return;
        }

        if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;

        // 元素节点染色防重搜
        if (root.nodeType === Node.ELEMENT_NODE) {
          if (root.__zh_scanned === true) return;
          root.__zh_scanned = true;
          translateElement(root);
          checkCompositeElement(root);
        }

        // TreeWalker 硬剪枝遍历
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
          acceptNode: function(node) {
            if (shouldSkip(node)) {
              return NodeFilter.FILTER_REJECT; // 核心：瞬间丢弃整棵消息正文/代码区子树！绝不深入！
            }
            return NodeFilter.FILTER_ACCEPT;
          }
        });

        let node = walker.nextNode();
        while (node) {
          if (node.nodeType === Node.TEXT_NODE) {
            const val = node.nodeValue;
            if (val && /[A-Za-z]/.test(val)) {
              if (!(node.__zh_done && node.__zh_last_val === val)) {
                const translated = translate(val);
                if (translated !== val) {
                  node.nodeValue = translated;
                  node.__zh_last_val = translated;
                  if (!/[A-Za-z]/.test(translated)) {
                    node.__zh_done = true;
                  }
                }
              }
            }
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            if (!node.__zh_scanned) {
              node.__zh_scanned = true;
              translateElement(node);
              checkCompositeElement(node);
            }
          }
          node = walker.nextNode();
        }
      } catch (e) {}
    }

    const zhThoughtCache = new Map();

    async function fetchGoogleTranslate(text) {
      if (!text || !text.trim()) return text;
      const trimmed = text.trim();
      if (zhThoughtCache.has(trimmed)) return zhThoughtCache.get(trimmed);

      if (trimmed.length > 2500) {
        const paragraphs = trimmed.split(/\n\s*\n/);
        const translatedParas = await Promise.all(paragraphs.map(p => fetchGoogleTranslate(p)));
        const combined = translatedParas.join('\n\n');
        zhThoughtCache.set(trimmed, combined);
        return combined;
      }

      const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=' + encodeURIComponent(trimmed);
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        if (Array.isArray(data) && Array.isArray(data[0])) {
          const translated = data[0].map(item => item && item[0] ? item[0] : '').join('');
          zhThoughtCache.set(trimmed, translated);
          return translated;
        }
      } catch (e) {
        console.warn('[Antigravity-Hans] Thought translate error:', e.message);
      }
      return null;
    }

    function isTranslationEnabled() {
      try {
        if (typeof window !== 'undefined' && window.zhTranslationBridge && typeof window.zhTranslationBridge.isEnabled === 'function') {
          return window.zhTranslationBridge.isEnabled();
        }
        if (typeof localStorage !== 'undefined') {
          const val = localStorage.getItem('antigravity_zh_translation_enabled');
          if (val === 'true') return true;
          if (val === 'false') return false;
        }
      } catch (e) {}
      return false;
    }

    function initSelectionTranslationBubble() {
      /* Selection translation completely removed to preserve pure official Quote layout */
    }

    // ========================================================================
    // 【核心调度器】6ms 时间切片非阻塞异步批处理器 (Time-Sliced Non-Blocking Batcher)
    // 彻底杜绝长任务 (Long Task)，永远保持 60fps/120fps 满帧率丝滑响应！
    // ========================================================================
    let pendingNodes = [];
    let rafScheduled = false;

    function processBatchNodes() {
      rafScheduled = false;
      if (pendingNodes.length === 0) return;

      const startTime = (typeof performance !== 'undefined') ? performance.now() : Date.now();
      const TIME_BUDGET_MS = 6; // 核心：每次微任务预算上限仅 6ms，为浏览器渲染留足 10ms，绝对 0 掉帧！

      // 1. 父子包含去重（从当前批次中剔除已被包含的后代节点）
      const rawBatch = pendingNodes.splice(0, pendingNodes.length);
      const uniqueRoots = [];
      for (let i = 0; i < rawBatch.length; i++) {
        const target = rawBatch[i];
        if (!target || !target.isConnected) continue;
        if (target.__zh_scanned === true) continue;
        
        let isContained = false;
        for (let j = 0; j < uniqueRoots.length; j++) {
          if (uniqueRoots[j].contains && uniqueRoots[j].contains(target)) {
            isContained = true;
            break;
          }
        }
        if (!isContained) {
          uniqueRoots.push(target);
        }
      }

      // 2. 带时间预算的平滑遍历
      let processedIndex = 0;
      for (let i = 0; i < uniqueRoots.length; i++) {
        const target = uniqueRoots[i];
        if (target && target.isConnected && !target.__zh_scanned) {
          translateNode(target);
        }
        processedIndex = i + 1;

        // 时间预算超限判定：出让主线程给浏览器绘制下一帧！
        const now = (typeof performance !== 'undefined') ? performance.now() : Date.now();
        if (now - startTime > TIME_BUDGET_MS && processedIndex < uniqueRoots.length) {
          break;
        }
      }

      // 3. 将未完成的节点重新推入队列，调度下一帧继续无感处理
      if (processedIndex < uniqueRoots.length) {
        for (let i = processedIndex; i < uniqueRoots.length; i++) {
          pendingNodes.push(uniqueRoots[i]);
        }
        rafScheduled = true;
        if (typeof requestAnimationFrame !== 'undefined') {
          requestAnimationFrame(processBatchNodes);
        } else {
          setTimeout(processBatchNodes, 10);
        }
      }
    }

    function run() {
      try {
        if (document.documentElement) {
          document.documentElement.lang = 'zh-CN';
        }
        if (!document.getElementById('antigravity-zh-style')) {
          try {
            const style = document.createElement('style');
            style.id = 'antigravity-zh-style';
            style.textContent = `
              /* 仅针对按钮、Monaco下拉框等特定控件防折行，严格排除可编辑输入框 */
              button[role="combobox"], button[role="button"], button, .monaco-dropdown, .quick-input-filter {
                white-space: nowrap !important;
              }
              /* 彻底恢复对话输入框、文本编辑区的正常自动换行与竖向滚动，坚决杜绝任何横向滑块 */
              [data-lexical-editor], [data-lexical-editor] *, [contenteditable="true"], [contenteditable="true"] *, [role="textbox"], [role="textbox"] * {
                white-space: pre-wrap !important;
                word-break: break-word !important;
                overflow-wrap: anywhere !important;
              }
              [data-lexical-editor], [contenteditable="true"] {
                overflow-x: hidden !important;
                overflow-y: auto !important;
              }
              /* Selection quote popup css removed */
`;
            (document.head || document.documentElement).appendChild(style);
          } catch (e) {}
        }

        // 首屏快速遍历
        translateNode(document.body || document.documentElement);

        if (typeof window !== 'undefined') {
          window.__antigravityTranslateText = translate;
          window.reapplyAntigravityZh = () => {
            try {
              const walker = document.createTreeWalker(document.body || document.documentElement, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, null, false);
              let n = walker.nextNode();
              while (n) {
                if (n.nodeType === Node.TEXT_NODE) {
                  delete n.__zh_last_val;
                  delete n.__zh_done;
                } else if (n.nodeType === Node.ELEMENT_NODE) {
                  delete n.__zh_last_attr_val;
                  delete n.__zh_scanned;
                  delete n.__zh_skip;
                }
                n = walker.nextNode();
              }
              translateNode(document.body || document.documentElement);
            } catch(e) {}
          };
        }

        initSelectionTranslationBubble();

        // 纯净高性能防抖观察器：完全剔除 characterData 监听
        new MutationObserver((mutations) => {
          try {
            let hasAdded = false;
            for (let i = 0; i < mutations.length; i++) {
              const m = mutations[i];
              if (m.type === 'childList') {
                for (let j = 0; j < m.addedNodes.length; j++) {
                  const node = m.addedNodes[j];
                  if (!node) continue;
                  // 入口级光速熔断：若是纯只读正文、代码块、终端、用户输入气泡，0 毫秒丢弃，不进队列！
                  if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.__zh_scanned === true || node.__zh_skip === true) continue;
                    const tag = node.tagName ? node.tagName.toLowerCase() : '';
                    if (tag === 'svg' || tag === 'path' || tag === 'code' || tag === 'pre' || tag === 'script' || tag === 'style') {
                      continue;
                    }
                    if (node.matches && node.matches('.markdown-body, .monaco-editor, .terminal, .xterm, pre, code, [data-testid="user-input-step"]')) {
                      node.__zh_skip = true;
                      continue;
                    }
                  }
                  pendingNodes.push(node);
                  hasAdded = true;
                }
              } else if (m.type === 'attributes') {
                const target = m.target;
                if (target && target.isConnected) {
                  translateElement(target);
                }
              }
            }
            if (hasAdded && !rafScheduled) {
              rafScheduled = true;
              if (typeof requestAnimationFrame !== 'undefined') {
                requestAnimationFrame(processBatchNodes);
              } else {
                setTimeout(processBatchNodes, 16);
              }
            }
          } catch (e) {}
        }).observe(document.documentElement || document, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['aria-label', 'title', 'placeholder', 'alt'],
        });
      } catch (e) {}
    }

    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', run, { once: true });
    } else {
      run();
    }
  })();
} catch (e) {
  console.warn('[Antigravity-Hans] Injected script caught exception:', e);
}
