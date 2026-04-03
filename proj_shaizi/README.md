# 🎲 3D 掷骰子模拟器 (3D Dice Roller)

这是一个基于纯 Web 技术（HTML5, CSS3, JavaScript）实现的 3D 掷骰子模拟器。它通过 CSS 3D 转换实现逼真的立方体效果，并伴随平滑的物理滚动动画。

---

## ✨ 核心特性 (Features)

- **逼真 3D 视觉**：利用 `CSS 3D Transforms` 构建完整的六面骰子模型。
- **物理反馈动画**：模拟真实的旋转惯性，支持多圈随机翻转。
- **纯代码实现**：不依赖任何外部图片素材，点数布局采用 `CSS Grid` 精确绘制。
- **双骰联动**：支持同时投掷两个骰子，并实时计算并显示点数总和。
- **响应式设计**：适配桌面端与移动端浏览器。

## 🛠️ 技术栈 (Tech Stack)

- **HTML5**: 结构化页面与骰子容器。
- **CSS3**: 
  - `perspective` & `preserve-3d`: 开启 3D 空间。
  - `transition` & `cubic-bezier`: 细腻的旋转动画。
  - `Grid Layout`: 骰子点数（Dot）的排版布局。
- **JavaScript (Vanilla JS)**: 随机数逻辑生成与 3D 旋转角度动态计算。

## 🚀 快速开始 (Getting Started)

本项目为纯静态项目，无需安装任何依赖，即可直接运行。

### 方式 1：本地预览
1. 下载或克隆本仓库。
2. 双击项目根目录下的 `index.html`，使用现代浏览器（Chrome, Edge, Firefox, Safari）打开即可。

### 方式 2：使用轻量级服务器 (推荐)
如果你安装了 Python，可以在项目目录下执行：
```bash
python3 -m http.server 8000
```
然后在浏览器访问 `http://localhost:8000`。

## 📖 文件结构 (Structure)

```text
.
├── index.html    # 程序主入口（包含样式与脚本）
├── shaizi.md     # 项目开发详细文档（技术细节说明）
└── README.md     # 项目说明文档
```

## 📝 运行说明

- 点击 **“投掷骰子！”** 按钮，骰子将开始随机滚动。
- 滚动持续约 1.2 秒后，下方会自动结算并显示两个骰子的点数之和。

---
*Created by Gemini CLI - 2026*
