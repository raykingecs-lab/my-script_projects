# Garmin 跑步数据全能分析看板 (Garmin Full Analyzer)

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Version](https://img.shields.io/badge/Version-2.11-green.svg)
![ECharts](https://img.shields.io/badge/Powered%20by-ECharts-red.svg)
![Tailwind](https://img.shields.io/badge/Styled%20with-TailwindCSS-38B2AC.svg)

这是一个专为 Garmin 跑者设计的纯本地数据分析工具。通过上传 Garmin Connect 导出的 CSV 文件，即可获得精细、多维的可视化报告。**无需上传云端，完美保护您的隐私。**

## 🚀 核心功能

### 1. 深度汇总报表 (Macro View)
- **年度距离统计**：汇总 3-9km、10-19km、20-24km 及 25-35km 的跑步频次。
- **赛事清单原生显示**：自动提取赛事记录，完赛时间直接取自 CSV **原始耗时**，无折算误差。
- **智能统计报表**：按月、按年统计汇总，月报表优化为单屏完整展示。

### 2. 智能多维热力图
- **跑量分布**与**心率强度**双重视角。支持日/月视图自动切换，月视角采用科学的距离加权平均心率。

### 3. 双重纪录对比 (PB vs PW)
- 提取各距离段（5k/10k/半马/全马）的最快与最慢表现。采用区间锁定逻辑，防止数据重叠干扰。

### 4. 单次计圈深度分析 (Micro View)
- 完全还原原版深度分析布局，支持 DataZoom 缩放与垂直指标平铺。

## 📖 使用指南
1. **导出数据**：从 Garmin Connect Web 端导出 `Activities.csv` 或单次活动的计圈 CSV。
2. **加载看板**：直接浏览器打开 `garmin_full_analyzer.html`。
3. **上传分析**：点击按钮或拖入文件，系统自动匹配视图。

---
*跑无止境，数据先行。*
