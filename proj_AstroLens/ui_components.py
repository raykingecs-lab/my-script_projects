import streamlit as st

def apply_custom_style():
    """
    注入全局 CSS，打造神秘感星象风格。
    """
    st.markdown("""
    <style>
    /* 全局背景与文字对比度优化 */
    .main {
        background-color: #0b0d17;
        color: #ffffff; /* 提升为纯白 */
    }
    .stApp {
        background-image: radial-gradient(circle at 50% 50%, #1c1f33 0%, #05070a 100%);
    }
    
    /* 针对 Streamlit 默认标签文字的优化 */
    .stMarkdown p, .stMarkdown li, .stMetric label {
        color: #f0f0f0 !important;
        font-weight: 400;
        letter-spacing: 0.5px;
    }
    
    /* 标题增强 */
    h1, h2, h3, h4 {
        color: #f1c40f !important; /* 金黄色标题 */
        text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
    }

    /* 优化卡片背景与边框 */
    .zodiac-card {
        background: rgba(255, 255, 255, 0.08); /* 稍微增加透明度 */
        border-radius: 15px;
        padding: 20px;
        border: 1px solid rgba(255, 255, 255, 0.15);
        margin-bottom: 20px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.5);
    }

    /* 指标数值加亮 */
    div[data-testid="stMetricValue"] {
        color: #ffffff !important;
        text-shadow: 0 0 5px rgba(241, 196, 15, 0.3);
    }

    .stat-label {
        font-size: 0.95em;
        color: #cccccc; /* 调亮标签色 */
        margin-bottom: 5px;
    }
    .stat-value {
        font-size: 1.25em;
        font-weight: bold;
        color: #f1c40f;
    }
    .lucky-number {
        display: inline-block;
        background: linear-gradient(135deg, #f1c40f 0%, #d4ac0d 100%);
        color: #000;
        padding: 2px 10px;
        border-radius: 5px;
        font-weight: 800;
    }
    
    /* 修正 Expander 文字颜色 */
    .streamlit-expanderHeader {
        color: #ffffff !important;
        background-color: rgba(255, 255, 255, 0.05) !important;
    }
    </style>
    """, unsafe_allow_html=True)

def render_star_rating(percentage_str):
    """
    根据百分比字符串渲染星星。
    """
    try:
        val = int(percentage_str.strip('%'))
        stars = round(val / 20)
        return "⭐" * stars + "🌑" * (5 - stars)
    except:
        return "⭐" * 3

def render_horoscope_card(data):
    """
    渲染主运势展示区域。
    """
    st.markdown(f"### 🔮 {data['name']} · {data['datetime']} 运势")
    
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.markdown(f"<div class='stat-label'>综合运势</div>", unsafe_allow_html=True)
        st.markdown(f"<div class='stat-value'>{render_star_rating(data['all'])}</div>", unsafe_allow_html=True)
    with col2:
        st.markdown(f"<div class='stat-label'>幸运数字</div>", unsafe_allow_html=True)
        st.markdown(f"<div class='stat-value'><span class='lucky-number'>{data['number']}</span></div>", unsafe_allow_html=True)
    with col3:
        st.markdown(f"<div class='stat-label'>幸运颜色</div>", unsafe_allow_html=True)
        st.markdown(f"<div class='stat-value' style='color:{data['color']}'>{data['color']}</div>", unsafe_allow_html=True)
    with col4:
        st.markdown(f"<div class='stat-label'>幸运挂件</div>", unsafe_allow_html=True)
        st.markdown(f"<div class='stat-value'>{data.get('lucky_charm_llm', data['lucky_charm'])}</div>", unsafe_allow_html=True)

    st.divider()
    
    # 润色后的摘要
    if "polished_summary" in data:
        st.info(f"✨ **深度洞察**：\n\n{data['polished_summary']}")
        with st.expander("🪐 星象相位解析"):
            st.write(data['astrology_insights'])
        with st.expander("🛡️ 避坑指南"):
            st.write(data['practical_advice'])
    else:
        st.info(f"📝 **今日寄语**：\n\n{data['summary']}")

    # 四大维度
    st.markdown("#### 📐 运势维度")
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("爱情 ❤️", data['love'])
    c2.metric("事业 💼", data['work'])
    c3.metric("财富 💰", data['money'])
    c4.metric("健康 🏥", data['health'])
