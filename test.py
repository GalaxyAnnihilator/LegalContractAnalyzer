import os
from openai import OpenAI
from httpx import Timeout
from dotenv import load_dotenv

# Load variables from .env into environment
load_dotenv()

API_KEY = os.getenv("OPENAI_API_KEY","TRANMINHDUONGDEPTRAI")
BASE_URL = "https://glowing-workable-arachnid.ngrok-free.app/v1"

client = OpenAI(
    api_key=API_KEY,
    base_url=BASE_URL,
    timeout=Timeout(30.0),
)

print("Succesfully created a client instance")

stream = client.chat.completions.create(
    model="Qwen3-0.6B",
    messages=[{"role":"user","content":"Do you know what RAG technology is?"}],
    temperature=0.7,
    max_tokens=512,
    stream=True,
)

# Consume the stream
for event in stream:
    choice = event.choices[0]
    # If the model is still generating, .delta.content will hold the next token(s)
    if delta := choice.delta.content:
        print(delta, end="", flush=True)

print("\n")    
