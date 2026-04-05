# Garmin 跑步数据全能分析看板 (Garmin Full Analyzer)

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Version](https://img.shields.io/badge/Version-2.7-green.svg)
![ECharts](https://img.shields.io/badge/Powered%20by-ECharts-red.svg)
![Tailwind](https://img.shields.io/badge/Styled%20with-TailwindCSS-38B2AC.svg)

这是一个专为 Garmin 跑者设计的纯本地数据分析工具。通过上传 Garmin Connect 导出的 CSV 文件，即可获得精细、多维的可视化报告。**无需上传云端，完美保护您的隐私。**

## 🚀 核心功能

### 1. 单次计圈分析 (默认模式)
- **还原级交互**：完全还原原版布局，支持 **DataZoom 缩放滑块** 进行公里级微观分析。
- **垂直平铺图表**：步长、心率、配速三大指标垂直布局，为您提供开阔视野。
- **智能明细表**：自动高亮统计行，清晰区分分段与总计数据。

### 2. 趋势概览分析 (双重纪录墙)
- **双重纪录对比**：
  - **最快记录 (PB Wall)**：展示各距离段的最佳成绩。
  - **最慢记录 (PW Wall)**：展示各距离段的最慢完成，助您审视耐力基准。
- **精确统计逻辑**：采用“距离区间锁定”算法，确保纪录准确归类，不受其他运动距离干扰。
- **宏观统计报表**：按年、按月的汇总统计表格，直观查阅历史跑量。
- **全量时间过滤**：顶部日期筛选器可实时同步所有图表、报表与纪录。

### 3. 智能多语识别
系统根据上传文件内容无缝切换视图，支持中英文关键词识别。

## 📖 使用指南
1. **导出数据**：从 Garmin Connect Web 端导出 `Activities.csv` 或单次活动的计圈 CSV。
2. **加载看板**：直接浏览器打开 `garmin_full_analyzer.html`。
3. **上传分析**：点击“上传 CSV”或拖入文件，模式会自动适配。

## 🔒 隐私声明
纯前端应用，计算与绘图均在本地完成。**您的轨迹与生理数据绝不上传服务器。**

---
*跑无止境，数据先行。*
