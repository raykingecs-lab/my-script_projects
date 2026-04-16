# 脉安 (PulseGuard) - 长辈专属血压助手

**脉安 (PulseGuard)** 是一款专为中老年人设计的纯本地血压记录与分析工具。我们深知长辈在数字化健康管理中的痛点，因此在设计上追求极致的“大、简、稳”，在数据上追求“深、精、准”。

---

## ✨ 核心特性

### 1. 老年人适配设计 (Elderly-friendly)
- **超大字号**：关键数值 42-48pt，确保不戴老花镜也能看清。
- **高对比度**：严格遵循红（预警）、黄（关注）、绿（正常）语义色规范。
- **极简交互**：90x90px 超大触控步进器，支持长按增减或直接点击输入。

### 2. 智能健康结论 (Smart Insights)
- **大白话反馈**：首页自动合成结论，用温度感十足的文字代替冰冷的数字。
- **风险预警**：精准捕捉“清晨高血压”风险及异常血压波动。
- **多维度分析**：支持左/右手最新值对比，帮助发现双臂血压差值隐患。

### 3. 三级数据溯源 (Data Drill-down)
- **层级清晰**：日期汇总 -> 测量记录 -> 原始明细。
- **关联模式**：独特的“明细 + 汇总”关联模式，每一笔平均值背后都有 1-3 次原始数据作为支撑。

### 4. 情景增强趋势 (Contextual Trends)
- **备注过滤器**：支持按“服药后”、“刚运动”等情景一键过滤折线图，快速验证药物或生活习惯对血压的影响。
- **日月标记**：图表自动通过 ☀️/🌙 标记测量时刻。

### 5. 绝对隐私与安全 (Privacy First)
- **纯本地存储**：数据仅存在手机 SQLite 数据库中，不上传云端，无网络权限。
- **数据自主**：一键导出 Excel 兼容的 CSV 报告，或备份原始 `.db` 数据库。

---

## 🛠 技术栈

- **框架**: [Expo](https://expo.dev/) (React Native 0.81 / React 19)
- **数据库**: [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/) (单例连接模式)
- **图表**: [react-native-gifted-charts](https://github.com/Abhinav-ark/react-native-gifted-charts)
- **导航**: React Navigation (Bottom Tab + Modal 下钻)

---

## 🚀 快速启动

1. **安装依赖**:
   ```bash
   npm install
   ```

2. **启动项目**:
   ```bash
   npx expo start
   ```

3. **Android 兼容性说明**:
   针对 React 19 环境下的 Android 原生崩溃问题，项目已内置以下优化：
   - 禁用原生屏幕优化 (`enableScreens(false)`)。
   - 移除 `allowFontScaling` 以确保 UI 稳定性。
   - 采用数据库连接单例模式。

---

## 📂 目录结构

- `src/database/` - 核心 SQL 统计逻辑与 CRUD 封装。
- `src/hooks/` - 包含智能结论算法 (`useDashboardStats`) 及数据过滤逻辑。
- `src/screens/` - Dashboard、录入、历史、趋势、设置四大核心页面。
- `src/components/common/` - 适配大字号的 `ScaledText` 与 `Stepper` 标准件。

---

## 📝 许可证

基于 MIT 协议开源。为了您和长辈的隐私，请放心使用。

© 2026 脉安健康项目组
