# Mac Calendar

一款运行在 macOS 菜单栏的精美日历应用，支持农历、节气、法定节假日显示。

## ✨ 功能特性

*   **菜单栏常驻**：在 macOS 菜单栏实时显示日期、星期和时间（精确到分钟）。
*   **便捷月视图**：点击菜单栏图标即可展开月视图日历，失去焦点自动隐藏。
*   **农历支持**：完整支持农历日期、节气显示。
*   **节假日集成**：
    *   支持中国大陆法定节假日及调休安排（红色“休”字，灰色“班”字）。
    *   支持传统农历节日。
*   **精美 UI**：
    *   macOS 原生风格磨砂玻璃效果。
    *   支持深色模式（Dark Mode）自动适配。

## 🛠 技术栈

*   **Electron**: 桌面应用框架
*   **React**: UI 库
*   **Vite**: 构建工具
*   **lunar-javascript**: 专业的农历/节假日库

## 📅 节假日数据维护

本项目使用 `lunar-javascript` 库来获取中国大陆的法定节假日和调休数据。由于每年的放假安排由国务院在上一年的年底发布，因此需要定期更新该依赖库以获取最新的数据。

**更新方法：**

当新一年的节假日安排发布后，请运行以下命令更新依赖：

```bash
npm update lunar-javascript
```

或者手动指定版本（如果需要）：

```bash
npm install lunar-javascript@latest
```

更新后重新构建应用即可生效。

## 🚀 开发与运行

### 环境要求
*   Node.js (建议 v16+)
*   macOS 系统

### 安装依赖

```bash
npm install
```

### 启动开发环境

```bash
npm run electron:dev
```

### 构建应用

构建前端资源：
```bash
npm run build
```

打包生成 macOS 应用 (.dmg / .app)：
```bash
npm run dist
```
打包后的文件位于 `release` 目录。

## 📝 目录结构

```
calendar/
├── electron/        # Electron 主进程代码
├── src/            # React 渲染进程代码
│   ├── components/ # UI 组件
│   └── utils/      # 工具函数（农历处理等）
├── index.html      # 入口 HTML
└── package.json    # 项目配置