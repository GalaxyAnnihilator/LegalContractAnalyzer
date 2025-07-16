import gradio as gr
from openai import OpenAI
import os
from dotenv import load_dotenv
load_dotenv()
API_KEY = os.getenv("OPENAI_API_KEY", "TRANMINHDUONGDEPTRAI")
BASE_URL = "https://glowing-workable-arachnid.ngrok-free.app/v1"  # or ngrok URL
client = OpenAI(api_key=API_KEY, base_url=BASE_URL)


def load_action(files, prompt):
    # TODO: implement PDF loading
    return "(PDF loading functionality not implemented)"

# Pure‑frontend chat stub
def chat_action(message, history):
    user_msg = {"role": "user", "content": message}
    bot_msg  = {"role": "assistant", "content": "(Chat functionality not implemented)"}
    return history + [user_msg, bot_msg]

with gr.Blocks(theme="soft",title="Legal Contract Analyzer") as demo:
    gr.Markdown("## 📄 Legal Contract Analyzer")
    with gr.Row():
        with gr.Column():
            # PDF Upload UI
            pdf_upload = gr.File(
                label="Upload PDF(s)",
                file_count="multiple",
                file_types=[".pdf"]
            )
            # Custom System Prompt UI
            system_prompt = gr.Textbox(
                label="System Prompt (optional)",
                placeholder="Enter custom system prompt here...",
                lines=2
            )
            load_btn = gr.Button("Load PDFs")
            status = gr.Textbox(
                label="Status",
                interactive=False,
                placeholder="Status messages will appear here"
            )
        with gr.Column():
            # Chat UI
            chat = gr.Chatbot(label="Chat",type="messages")
            user_input = gr.Textbox(
                label="Your question:",
                placeholder="Type your question here..."
            )
            send_btn = gr.Button("Send")

    # Wire up buttons to stub functions
    load_btn.click(fn=load_action, inputs=[pdf_upload, system_prompt], outputs=[status])
    send_btn.click(fn=chat_action, inputs=[user_input, chat], outputs=[chat])

# Launch the Gradio demo without backend implementation
demo.launch(server_name="0.0.0.0", server_port=7860)
