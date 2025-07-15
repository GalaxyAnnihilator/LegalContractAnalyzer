import os
from openai import OpenAI
from dotenv import load_dotenv
import gradio as gr

load_dotenv()
API_KEY = os.getenv("OPENAI_API_KEY", "TRANMINHDUONGDEPTRAI")
BASE_URL = "https://glowing-workable-arachnid.ngrok-free.app/v1"  # or ngrok URL

client = OpenAI(api_key=API_KEY, base_url=BASE_URL)

def predict(message, history):
    messages = []
    print("HISTORY:",history)
    messages.append({"role": "user", "content": message})

    stream = client.chat.completions.create(
        model="Qwen3-0.6B",
        messages=messages,
        stream=True
    )

    full_reply = ""
    for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            full_reply += delta
            yield full_reply

demo = gr.ChatInterface(predict, title="Your Bot", type="messages")
demo.launch(share=True)
