import openai
from config import get_api_keys

def polish_horoscope(raw_data):
    """
    使用 LLM 润色运势数据。
    raw_data: 来自 api_client 的原始 JSON 数据
    """
    api_info = get_api_keys()
    
    if not api_info["openai_key"]:
        return raw_data  # 没有 Key，直接返回原始数据

    client = openai.OpenAI(
        api_key=api_info["openai_key"],
        base_url=api_info["base_url"]
    )
    
    prompt = f"""
你是一位资深的专业占星师。请根据以下提供的原始星座运势数据，使用专业、神秘且富有洞察力的语言进行深度润色。
要求：
1. 包含星象相位术语（如：三分相、合相、逆行影响等）。
2. 提供深度的心理层面的分析。
3. 给出具体的避坑指南或行动建议。
4. 保持中文表达的优雅与精准。

原始数据：
- 星座：{raw_data['name']}
- 日期：{raw_data['datetime']}
- 综合指数：{raw_data['all']}
- 爱情：{raw_data['love']}
- 事业：{raw_data['work']}
- 财运：{raw_data['money']}
- 健康：{raw_data['health']}
- 幸运数字：{raw_data['number']}
- 幸运颜色：{raw_data['color']}
- 原始摘要：{raw_data['summary']}

输出格式（JSON）：
{{
  "polished_summary": "润色后的深度解析",
  "astrology_insights": "星象相位深度分析",
  "practical_advice": "具体的避坑指南与建议",
  "lucky_charm": "基于星象推荐的幸运挂件"
}}
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4-turbo-preview",  # 或使用 deepseek-chat
            messages=[
                {"role": "system", "content": "你是一位精通西方现代占星术的高级占星师。"},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        import json
        polished_json = json.loads(response.choices[0].message.content)
        
        # 将润色后的内容合并进原数据
        raw_data["polished_summary"] = polished_json.get("polished_summary")
        raw_data["astrology_insights"] = polished_json.get("astrology_insights")
        raw_data["practical_advice"] = polished_json.get("practical_advice")
        raw_data["lucky_charm_llm"] = polished_json.get("lucky_charm")
        return raw_data
        
    except Exception as e:
        print(f"LLM Processing Error: {e}")
        return raw_data # 发生错误则回退
