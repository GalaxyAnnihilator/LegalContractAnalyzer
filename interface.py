from transformers import AutoModelForCausalLM, AutoTokenizer, TextIteratorStreamer
import gradio as gr
import torch
import threading

checkpoint = "unsloth/Qwen2.5-0.5B-Instruct-bnb-4bit"
device = "cpu"  # or "cuda" if you have GPU
tokenizer = AutoTokenizer.from_pretrained(checkpoint)
model = AutoModelForCausalLM.from_pretrained(checkpoint).to(device)

def predict(message, history):
    # Append user message to the chat history
    history.append({"role": "user", "content": message})

    # Convert chat history into formatted prompt
    input_text = tokenizer.apply_chat_template(history, tokenize=False)

    # Tokenize and move to device
    inputs = tokenizer.encode(input_text, return_tensors="pt").to(device)

    # Create streamer
    streamer = TextIteratorStreamer(tokenizer, skip_prompt=True, skip_special_tokens=True)

    # Launch generation in a separate thread
    generation_kwargs = dict(
        input_ids=inputs,
        streamer=streamer,
        max_new_tokens=100,
        temperature=0.2,
        top_p=0.9,
        do_sample=True
    )
    thread = threading.Thread(target=model.generate, kwargs=generation_kwargs)
    thread.start()

    # Accumulate and stream output token-by-token
    partial = ""
    for token in streamer:
        partial += token
        yield partial

# Gradio ChatInterface with streaming enabled
demo = gr.ChatInterface(
    fn=predict,
    type="messages"
)

demo.launch(share=True)
