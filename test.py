from transformers import pipeline

pipe = pipeline("text-generation", model="unsloth/Qwen2.5-0.5B-Instruct-bnb-4bit")
messages = [
    {"role": "user", "content": "Who are you?"},
]
pipe(messages)