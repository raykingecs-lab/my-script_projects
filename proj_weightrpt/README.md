# WeightRpt - 个人体重数据看板

WeightRpt 是一个简洁美观的单文件 Web 应用，旨在帮助用户快速分析历史体重数据并可视化健康趋势。

![Version](https://img.shields.io/badge/version-1.2.0-red)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ 特性
- **生态兼容**: 无缝支持标准格式以及 **Garmin Connect** 导出的体重 CSV，系统自动判定。
- **峰值追踪**: 核心关注**年度最高体重趋势**，直观把控健康红线。
- **全方位分析**: 包含每日趋势、BMI 计算及理想体重参考。
- **极值追踪**: 自动汇总历年最高/最低体重，**支持悬停查看精准达成日期**。
- **离线隐私**: 100% 浏览器本地处理，数据不经过服务器，保障隐私。

## 🚀 快速开始
1. 下载 `weightrpt.html`。
2. 准备一份 CSV 文件：
   - 格式 A：`YYYY-MM-DD,体重`
   - 格式 B：Garmin Connect 原生导出的体重数据。
3. 在浏览器中打开文件，上传 CSV（默认身高基准为 174cm，可实时修改）。

## 📊 功能展示
- **体重墙**: 快速查看历史极值。
- **BMI 指北**: 计算 BMI 并给出当前身高下的正常体重范围。
- **年度最高趋势**: 红色曲线锁定每年体重峰值，警示健康风险。
- **年度统计表**: 详尽展现历年最高、最低（支持悬停看日期）及平均数值。

## 🛠️ 技术栈
- HTML5 / CSS3 / JavaScript
- [ECharts](https://echarts.apache.org/) - 强大的可视化库
