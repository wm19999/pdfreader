from flask import Flask, jsonify, request, Response
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
import os
from dotenv import load_dotenv
from openai import OpenAI
load_dotenv()

client = OpenAI(
    api_key = os.environ.get("ARK_API_KEY"),
    base_url = "https://ark.cn-beijing.volces.com/api/v3",
)

@app.route('/')  # 主页返回提示
def home():
    return "Flask 服务器运行正常！请访问 /api/message"

@app.route('/api/message', methods=['GET', 'POST'])  # 必须用POST
def get_message():
    if request.method == 'GET':
        return jsonify({"message": "请使用 POST 发送数据"})
    data = request.get_json()  # 获取 JSON 数据
    print(f"request:{request}")
    user_input = data.get("text", "")
    label = data.get("label", "")
    print(f"request:{label}")
    def generate():
        if label == "translate":
            stream = client.chat.completions.create(
                model="ep-20250215140713-kfs9q",
                messages=[
                    {"role": "system", "content":'你是一名专业的论文翻译员，精通学术英语与科技写作。你的任务是将用户提供的论文文本翻译成流畅、精准的目标语言（如中文或英文）。'},
                    {"role": "user", "content": user_input},
                ],
                stream=True  # 启用流式传输
            )
        else:
            stream = client.chat.completions.create(
                model="ep-20250215132839-4dh6l",
                messages=[
                    {"role": "system", "content": "你是一位专业的论文理解工程师，精通人工智能、计算机科学、自然语言处理及科学研究方法。你的任务是帮助用户理解论文或相关技术内容。"},
                    {"role": "user", "content": user_input},
                ],
                stream=True)

        for chunk in stream:
            if chunk.choices and chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content  # 逐块返回
        
    print("收到的数据:", data)  # 打印前端发送的数据
    
    return Response(generate(), content_type='text/event-stream')
if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5000)