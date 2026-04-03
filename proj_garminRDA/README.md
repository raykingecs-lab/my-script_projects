# Garmin 跑步数据分析仪表盘 (GarminRDA)

**GarminRDA** 是一款专为 Garmin 用户设计的纯本地跑步数据可视化工具。无需上传云端，通过解析 Garmin Connect 导出的 `Activities.csv` 文件，为您提供深度、直观的运动表现洞察。

---

## ✨ 核心特性

- 🔒 **隐私安全**: 100% 纯前端处理，所有数据仅在浏览器本地解析，绝不上传至任何服务器。
- 📊 **多维可视化**:
    - **日历热力图**: 仿 GitHub 贡献风格，直观展示年度运动频率。
    - **配速与心率趋势**: 双轴线图设计，支持 DataZoom 缩放，洞察体能变化。
    - **有氧训练效果 (TE) 分布**: 阶梯分布图，量化训练强度。
    - **步幅技术指标**: 趋势图展示跑步效率的演变。
- 🏆 **个人纪录墙 (PB)**: 自动提取并展示 5k、10k、半马、全马的最佳成绩。
- 🛠️ **鲁棒解析**: 智能识别 CSV 表头，适配不同语言或版本的 Garmin 导出文件。
- 📅 **实时筛选**: 支持自定义日期范围，即时刷新所有统计图表。

## 🚀 技术栈

- **可视化**: [Apache ECharts](https://echarts.apache.org/) - 工业级数据图表库。
- **UI 框架**: [Tailwind CSS](https://tailwindcss.com/) - 响应式、现代化的样式设计。
- **CSV 解析**: [PapaParse](https://www.papaparse.com/) - 高性能流式数据处理。
- **核心逻辑**: 原生 JavaScript (ES6+)。

## 📖 使用指南

### 1. 获取数据
1. 登录 [Garmin Connect Web](https://connect.garmin.com/)。
2. 进入“活动 (Activities)”页面。
3. 点击页面底部的“导出到 CSV (Export to CSV)”。

### 2. 查看看板
1. 直接在浏览器中打开项目根目录下的 `index.html`。
2. 点击“上传 CSV”按钮，选择您导出的 `Activities.csv` 文件。
3. 即可查看属于您的跑步数据看板。

## 📂 项目结构

```text
/
├── index.html        # 单文件 Web 应用（包含 UI 与 核心逻辑）
├── garminRDA.md      # 项目设计文档
├── GEMINI.md         # 项目上下文与开发规范
└── README.md         # 本说明文件
```

## 🛠️ 开发与规范

本项目遵循 `GEMINI.md` 中定义的开发标准：
- **纯粹性**: 优先使用标准库和轻量级工具。
- **性能**: 大文件解析需考虑流式处理，确保 UI 响应。
- **扩展性**: (未来计划) 引入 Python 后端进行更深度的跑步姿态分析或生理指标建模。

## 📄 开源协议

本项目采用 [MIT License](LICENSE) 开源协议。
