# 🔮 星曜历 (AstroLens)


**星曜历 (AstroLens)** 是一款基于 Streamlit 构建的沉浸式专业星象历 Web 应用。它结合了实时星座运势抓取与大语言模型（LLM）的深度加工，通过神秘感十足的暗色系界面，为您提供具有“专业占星术”深度的每日运势洞察。

---

## ✨ 功能亮点

- **🪐 沉浸式视觉体验**：采用深色星空主题，注入自定义 CSS 优化文字对比度，打造神秘且高级的占星氛围。
- **♈ 智能星座初始化**：首次进入可选择专属星座，配置自动本地持久化，下次访问直接开启星象。
- **📅 交互式历法查询**：内置交互日历，支持查询任意日期的运势走向。
- **🤖 AI 灵性增强 (LLM)**：支持接入 OpenAI/DeepSeek API。开启后，AI 将基于原始运势数据，使用专业占星相位术语进行深度润色，提供心理层面的深度分析。
- **📊 多维度运势看板**：
    - **核心指标**：综合运势（星级展示）、幸运数字、幸运颜色、幸运挂件。
    - **深度维度**：爱情、事业、财富、健康四大指数直观显示。
- **📱 响应式适配**：完美适配 PC 与手机浏览器端。

---

## 🛠️ 技术栈

- **框架**: [Streamlit](https://streamlit.io/)
- **语言**: Python 3.10+
- **数据流**: Requests + Mock Data Logic
- **AI 接口**: OpenAI Python SDK (兼容 DeepSeek)
- **样式**: Custom CSS + HTML Injection

---

## 🚀 快速开始

### 1. 环境准备
确保您的系统中已安装 Python 3.10 或更高版本。

### 2. 克隆项目
```bash
git clone https://github.com/your-username/AstroLens.git
cd AstroLens
```

### 3. 安装依赖
```bash
pip install -r requirements.txt
```

### 4. 启动应用
```bash
streamlit run main.py
```

---

## 📖 使用指南

1. **配置星座**：在欢迎界面选择您的星座，点击“开启今日星象”。
2. **查看运势**：主界面将展示今日的详细运势卡片。
3. **开启 AI 增强模式**：
    - 展开左侧侧边栏。
    - 输入您的 **OpenAI/DeepSeek API Key**。
    - 点击“保存配置”，应用将自动使用 LLM 生成包含相位解析和避坑指南的深度报告。
4. **修改配置**：您可以随时在侧边栏切换星座或更新 API 信息。

---

## 📂 项目结构

```text
proj_AstroLens/
├── main.py             # 应用入口及页面路由
├── config.py           # 配置管理与持久化 (Zodiac/API Keys)
├── api_client.py       # 运势数据抓取 (支持 Mock 数据)
├── llm_processor.py    # LLM 逻辑处理 (Prompt 工程)
├── ui_components.py    # UI 渲染组件与自定义 CSS
├── requirements.txt    # 项目依赖
└── AstroLens.md        # 详细设计方案说明文档
```

---

## 🛡️ 异常处理与安全

- **数据降级**：当 API 请求失败或 Key 无效时，系统会自动启用 Mock 数据逻辑，确保界面不白屏。
- **隐私保护**：API Key 仅保存在您本地的 `user_config.json` 中，不会上传至任何第三方服务器（LLM 提供商除外）。

---

## 📜 开源协议

本项目采用 [MIT License](LICENSE) 开源。

---

*“在浩瀚星海中，星光会指引你前进的方向。”*
