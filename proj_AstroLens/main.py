import streamlit as st
from datetime import datetime
from config import get_user_zodiac, set_user_zodiac, get_api_keys, save_api_keys, ZODIAC_MAPPING
from api_client import fetch_horoscope
from llm_processor import polish_horoscope
from ui_components import apply_custom_style, render_horoscope_card

# 页面配置
st.set_page_config(
    page_title="星曜历 AstroLens",
    page_icon="🔮",
    layout="wide",
    initial_sidebar_state="expanded"
)

# 应用自定义样式
apply_custom_style()

def main():
    zodiac = get_user_zodiac()

    # 1. 初始化逻辑：如果未选择星座，显示欢迎界面
    if not zodiac:
        st.markdown("<h1 style='text-align: center;'>✨ 欢迎来到星曜历 AstroLens ✨</h1>", unsafe_allow_html=True)
        st.markdown("<p style='text-align: center;'>在浩瀚星海中，探索属于你的命运轨迹。</p>", unsafe_allow_html=True)
        
        with st.container():
            col1, col2, col3 = st.columns([1, 2, 1])
            with col2:
                selected_zodiac = st.selectbox("请选择你的星座", list(ZODIAC_MAPPING.keys()))
                if st.button("🌟 开启今日星象", use_container_width=True):
                    set_user_zodiac(selected_zodiac)
                    st.rerun()
        return

    # 2. 侧边栏配置
    with st.sidebar:
        st.title("⚙️ 星象配置")
        
        # 修改星座
        new_zodiac = st.selectbox("当前星座", list(ZODIAC_MAPPING.keys()), index=list(ZODIAC_MAPPING.keys()).index(zodiac))
        if new_zodiac != zodiac:
            if st.button("更新星座"):
                set_user_zodiac(new_zodiac)
                st.rerun()
        
        st.divider()
        
        # LLM 配置
        st.subheader("🤖 灵性增强 (LLM)")
        api_info = get_api_keys()
        openai_key = st.text_input("DeepSeek/OpenAI API Key", value=api_info["openai_key"], type="password")
        base_url = st.text_input("API Base URL", value=api_info["base_url"])
        
        if st.button("保存 API 配置"):
            save_api_keys(openai_key, base_url)
            st.success("配置已保存")

    # 3. 主界面布局
    st.title("🔮 星曜历 · 今日星象")
    
    # 日历交互
    selected_date = st.date_input("选择日期以查询运势", datetime.now())
    date_str = selected_date.strftime("%Y-%m-%d")

    # 4. 数据流水线
    with st.spinner("正在连接星空，读取命理..."):
        # Step 1: 抓取
        raw_data = fetch_horoscope(zodiac, date_str)
        
        # Step 2: LLM 增强 (可选)
        final_data = polish_horoscope(raw_data)
        
        # Step 3: UI 渲染
        render_horoscope_card(final_data)

    st.divider()
    st.caption("AstroLens v1.0 | 星光指引前进的方向")

if __name__ == "__main__":
    main()
