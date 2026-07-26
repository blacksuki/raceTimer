# Race Timer (赛跑计时器 PRO) - AGENTS.md

本文件为 Antigravity AI Agent 专属的单文档项目规范（Project Specification & Agent Instructions）。包含项目架构、技术栈、模块职责、SEO 与 Accessibility 规范、Cloud Run 部署与开发指令及 Agent 代码修改守则。

---

## 1. 项目概述 (Project Overview)

- **项目名称**：Race Timer (赛跑计时器 PRO)
- **核心定位**：具备多语言（中/英/日）语音倒计时、拟真发令枪音效（Web Audio API 代码合成）、单人计圈与 8 跑道同步计时的专业 Web 赛跑计时软件。
- **UI 风格**：适配移动端拟真外壳 (`MobileFrame`)，采用高对比度暗色主题，集成发令枪开枪瞬间视觉火焰动画 (`MuzzleFlash`)。
- **部署域名**：`https://racetimer.ai.studio` (Google Cloud Run / Google AI Studio)

---

## 2. 技术栈与系统架构 (Tech Stack & Architecture)

| 领域 | 技术选型 | 版本/说明 |
| :--- | :--- | :--- |
| **前端框架** | React | 19.0.1 (使用 React 19 最新 Hooks) |
| **开发语言** | TypeScript | 5.8 (严格类型模式) |
| **构建工具** | Vite | 6.2.3 (集成 HMR 开关逻辑) |
| **样式系统** | Tailwind CSS | v4 (`@tailwindcss/vite` 插件) |
| **图标库** | Lucide React | 0.546.0 |
| **动画效果** | Framer Motion | 12.23.24 (用于 UI 弹窗与微动画) |
| **音频引擎** | Web Audio API + Web Speech API | 纯代码实时合成枪声/提示音及多语言 TTS 播报 |
| **部署托管** | Express + Google Cloud Run | Node.js 生产 Web 服务器与 Google Cloud 部署 |
| **数据导出** | UTF-8 BOM CSV / JSON | 支持带 `\uFEFF` BOM 的 Excel 友好 CSV 与完整 JSON |

---

## 3. 目录与模块全景 (Directory & Module Breakdown)

```text
raceTimer/
├── AGENTS.md                 # Antigravity Agent 项目全景开发规范（本文件）
├── agent.md                  # 同步镜像是 agent.md 供多平台 Agent 识别
├── .env.example              # 环境变量示例（包含 GCP_REGION=us-central1）
├── index.html                # HTML 入口（包含完整 SEO 标签、Canonical URL 及 Theme Color）
├── server.js                 # 生产环境 Express 静态资源与 SPA 路由服务器
├── metadata.json             # AI 应用元数据与能力声明
├── package.json              # 项目依赖与开发/部署脚本
├── tsconfig.json             # TypeScript 配置
├── vite.config.ts            # Vite 配置文件（集成 Tailwind v4 及 DISABLE_HMR 开关）
├── scripts/                  # 部署与运维自动化脚本
│   ├── deploy-code.sh        # 源码一键部署到 Google Cloud Run (默认 us-central1)
│   └── deploy-env.sh         # 更新 Cloud Run 环境变量脚本
└── src/
    ├── main.tsx              # 应用挂载入口
    ├── App.tsx               # 全局主控视图，管理模式、语言、历史记录与各 Modal 状态
    ├── index.css             # Tailwind 样式引入
    ├── types.ts              # TypeScript 全局接口与类型定义
    ├── components/           # UI 组件
    │   ├── MobileFrame.tsx   # 移动端拟真框架（语义化 header/nav/main/footer 结构）
    │   ├── CountdownOverlay.tsx # 倒计时全屏遮罩（预备口令、3/2/1 递减音与开枪）
    │   ├── MuzzleFlash.tsx   # 开枪瞬间闪光与火焰颗粒特效
    │   ├── SingleTimerView.tsx  # 单人计圈模式（语义化 section/article、毫秒级 Stopwatch、Lap/Split 表格）
    │   ├── EightLaneView.tsx    # 8 跑道同步计时（一键发令、次序记录 1-8 名、分差计算）
    │   ├── AudioTestModal.tsx   # 声音与发令枪测试调试弹窗
    │   └── HistoryModal.tsx     # 历史记录列表与详情弹窗（支持 CSV/JSON 导出、单条删除与一键清空）
    └── utils/                # 核心逻辑与工具库
        ├── audioEngine.ts    # Web Audio API 声音合成与 Web Speech TTS 播报单例引擎
        ├── i18n.ts           # 国际化词典 (zh-CN, en-US, ja-JP) 与 getTranslation
        └── exportUtils.ts    # 毫秒时间格式化 formatTimeMs 及 CSV/JSON 文件导出逻辑
```

---

## 4. SEO 与 可访问性（a11y）最佳实践 (SEO & Accessibility Best Practices)

为确保本项目维持最佳的搜索引擎优化（SEO）与无障碍体验，在开发与修改 UI 组件时必须遵循以下规范：

1. **Title & Meta 元标签规范 (`index.html`)**：
   - 保持主 `<title>` 具备描述性与关键字吸引力。
   - 包含规范网址 `<link rel="canonical" href="https://racetimer.ai.studio" />`。
   - 配置完整的 Open Graph (`og:title`, `og:description`, `og:url`) 与 Twitter Cards 字段。
   - 配置 `theme-color` 与嵌入式纯向量 SVG Favicon。

2. **语义化 HTML 5 标签 (Semantic HTML)**：
   - 整个应用视图必须包含明确的语义化结构：`<header>`, `<nav>`, `<main>`, `<footer>`。
   - 具体模式面板必须使用 `<section>` 和 `<article>` 包裹列表项。

---

## 5. 开发与部署指令 (Development & Deployment Commands)

```bash
# 1. 安装项目依赖
npm install

# 2. 启动本地开发服务器 (端口 3000, 绑 0.0.0.0)
npm run dev

# 3. 运行 TypeScript 类型检查（每次修改代码后必须运行验证）
npx tsc --noEmit

# 4. 本地打包与生产服务测试
npm run build
npm start

# 5. 部署到 Google Cloud Run (默认区域 us-central1)
CLOUD_RUN_SERVICE=race-timer GCP_REGION=us-central1 GCP_PROJECT_ID=<your-gcp-project-id> bash scripts/deploy-code.sh

# 6. 更新 Cloud Run 环境变量
CLOUD_RUN_SERVICE=race-timer GCP_REGION=us-central1 GCP_PROJECT_ID=<your-gcp-project-id> bash scripts/deploy-env.sh
```

---

## 6. Antigravity Agent 开发规范与核心机制 (Agent Development Rules)

### 6.1 音频引擎机制 (`src/utils/audioEngine.ts`)
- **懒加载 AudioContext**：浏览器策略规定 `AudioContext` 必须由用户首次操作激活。`initContext()` 包含用户交互激活逻辑，请勿删除或绕过。
- **拟真发令枪合成 (`playStarterGun`)**：
  - 白噪声源通过 `lowpass` BiquadFilter 做 `2200Hz -> 80Hz` 扫频模拟爆发。
  - 低频振荡器做 `160Hz -> 30Hz` 的 `sawtooth` / `triangle` 扫频模拟冲击波重低音。

### 6.2 多语言国际化规范 (`src/utils/i18n.ts`)
- 当前支持 `'zh-CN'`, `'en-US'`, `'ja-JP'` 3 种语言。修改或新增任何 UI 文本时须同步补充。

### 6.3 部署环境适配 (`server.js` & `scripts/deploy-code.sh`)
- `server.js` 使用 Express 托管 `dist/` 目录，监听 `process.env.PORT || 8080`，完美适配 Google Cloud Run 容器（默认区域 `us-central1`）。

---

## 7. 修改验证流程 (Verification Workflow)

在提出修改或完成功能开发后，必须按顺序执行以下验证：
1. 运行 `npx tsc --noEmit` 确保零 TypeScript 类型错误。
2. 运行 `npm run build` 确认打包产物生成无误。
3. 使用 `bash scripts/deploy-code.sh` 脚本验证 Cloud Run (`us-central1`) 部署状态。
