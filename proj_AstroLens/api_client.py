import requests
import random
from datetime import datetime

# 模拟 API 接口 (未来可以对接聚合数据或其它公开接口)
# API_URL = "http://web.juhe.cn/constellation/getAll"

def fetch_horoscope(zodiac_name, date_str=None):
    """
    获取指定星座和日期的运势。
    zodiac_name: 中文星座名 (如: '白羊座')
    date_str: 日期 (YYYY-MM-DD), 默认为今天
    """
    if not date_str:
        date_str = datetime.now().strftime("%Y-%m-%d")

    # MOCK 数据逻辑
    # 真实场景下应执行 requests.get(...)
    mock_data = {
        "name": zodiac_name,
        "datetime": date_str,
        "all": f"{random.randint(60, 100)}%",
        "color": random.choice(["紫色", "湖蓝色", "翡翠绿", "琥珀金", "午夜蓝", "丁香紫"]),
        "health": f"{random.randint(50, 95)}%",
        "love": f"{random.randint(50, 100)}%",
        "money": f"{random.randint(40, 95)}%",
        "number": random.randint(1, 10),
        "summary": f"今天{zodiac_name}在整体状态上表现平稳，星象运行至你的命宫位置。建议保持平常心，在处理琐碎事务时多一分耐心。",
        "work": f"{random.randint(50, 100)}%",
        "lucky_charm": random.choice(["水晶球", "黑曜石手链", "银质吊坠", "薰衣草精油", "古董硬币"])
    }
    
    # 模拟 API 延迟或异常
    try:
        # response = requests.get(f"{API_URL}?consName={zodiac_name}&type=today&key=YOUR_KEY")
        # if response.status_code == 200: return response.json()
        return mock_data
    except Exception as e:
        print(f"API Error: {e}")
        return mock_data # 回退到 Mock
