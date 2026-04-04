import json
import os
import streamlit as st

CONFIG_FILE = "user_config.json"

ZODIAC_MAPPING = {
    "白羊座": "Aries", "金牛座": "Taurus", "双子座": "Gemini",
    "巨蟹座": "Cancer", "狮子座": "Leo", "处女座": "Virgo",
    "天秤座": "Libra", "天蝎座": "Scorpio", "射手座": "Sagittarius",
    "摩羯座": "Capricorn", "水瓶座": "Aquarius", "双鱼座": "Pisces"
}

def load_config():
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def save_config(config):
    with open(CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(config, f, ensure_ascii=False, indent=4)

def get_user_zodiac():
    if "zodiac" not in st.session_state:
        config = load_config()
        st.session_state.zodiac = config.get("zodiac", None)
    return st.session_state.zodiac

def set_user_zodiac(zodiac):
    st.session_state.zodiac = zodiac
    config = load_config()
    config["zodiac"] = zodiac
    save_config(config)

def get_api_keys():
    config = load_config()
    return {
        "openai_key": config.get("openai_key", ""),
        "base_url": config.get("base_url", "https://api.openai.com/v1")
    }

def save_api_keys(openai_key, base_url):
    config = load_config()
    config["openai_key"] = openai_key
    config["base_url"] = base_url
    save_config(config)
