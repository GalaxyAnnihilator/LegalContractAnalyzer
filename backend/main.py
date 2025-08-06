from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import requests
import os
import json
from openai import OpenAI
import shutil
from backend.retrieve_documents import download_all_files
from backend.ingest import ingest_all
from backend.query import query_top_k
from dotenv import dotenv_values
import traceback
from prometheus_client import start_http_server, Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from starlette.responses import Response

app = FastAPI()

UPLOAD_FOLDER = "downloaded_pdfs"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "TRANMINHDUONGDEPTRAI")
FASTCHAT_URL = "https://glowing-workable-arachnid.ngrok-free.app/v1/"

client = OpenAI(
    api_key=OPENAI_API_KEY,
    base_url=FASTCHAT_URL  # FastChat OpenAI API server
)

# Allow all origins (dev only)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload_pdf")
async def upload_pdf(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"filename": file.filename, "status": "uploaded"}

@app.post("/retrieve_documents")
def retrieve_documents_api():
    try:
        download_all_files(UPLOAD_FOLDER)
        return {"status": "Success: ✅ Retrieval of documents"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ingest")
def ingest_api():
    try:
        ingest_all("./downloaded_pdfs")
        return {"status": "Success: ✅ Ingestion complete."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/query")
def query_api(payload: dict):
    try:
        # Extract user message from OpenAI-style payload
        messages = payload.get("messages", [])
        user_message = ""
        for m in messages:
            if m.get("role") == "user":
                user_message = m.get("content", "")
                break
        if not user_message:
            raise ValueError("No user message found in payload")
        top_chunks = query_top_k(user_message, k=3)
        # Return as a list of dicts for clarity
        return {
            "status": "Success: ✅ Retrieved similar contexts",
            "chunks": [
                {"text": chunk,
                 "score": float(dist)
                 } for chunk, dist in top_chunks
        ]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/rag_chat")
async def rag_chat(request: Request):
    try:
        body = await request.json()
        print("DEBUG body:", body)

        # Try to get user message from OpenAI-style format
        user_message = ""
        if "message" in body:
            user_message = body["message"]
        elif "messages" in body:
            for m in body["messages"]:
                if m.get("role") == "user":
                    user_message = m.get("content", "")
                    break

        user_message = user_message.strip()
        print("DEBUG user_message:", user_message)

        if not user_message:
            raise HTTPException(status_code=400, detail="No user message provided")

        # Retrieval
        top_chunks = query_top_k(user_message, k=3)
        print("DEBUG top_chunks:", top_chunks)

        context_texts = [chunk for chunk, _ in top_chunks]
        context_block = "\n\n".join(context_texts)

        rag_prompt = f"""You are a helpful assistant answering based on the provided context.
            Only use information from the context. If the answer is not in the context, say you don't know.

            Context:
            {context_block}

            Question:
        {user_message}"""

        print("DEBUG rag_prompt:", rag_prompt[:200], "...")

        def stream_generator():
            stream = client.chat.completions.create(
                model="Qwen3-0.6B",
                messages=[{"role": "user", "content": rag_prompt}],
                stream=True
            )
            for chunk in stream:
                yield f"data: {chunk.model_dump_json()}\n\n"
            yield "data: [DONE]\n\n"

        return StreamingResponse(stream_generator(), media_type="text/event-stream")

    except Exception as e:
        print("ERROR in /rag_chat:", str(e))
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/api_key")
def expose_api_key():
    keys = dotenv_values(".env")
    return keys        

@app.get("/")
def root():
    return {"message": "Backend API is running <3. Try /upload_pdf , /retrieve_documents , /ingest, /query"}

# ================MONITORING WITH PROMETHEUS==============
# Define your metrics
REQUEST_COUNT = Counter(
    "user_query_count_total", "Total number of user queries", ["method", "endpoint"]
)
REQUEST_LATENCY = Histogram(
    "rag_query_latency_seconds", "RAG end-to-end latency", ["method", "endpoint"]
)
FAILURE_COUNT = Counter(
    "rag_failure_count", "Number of failed RAG calls", ["method", "endpoint"]
)

@app.middleware("http")
async def metrics_middleware(request, call_next):
    method = request.method
    endpoint = request.url.path
    REQUEST_COUNT.labels(method=method, endpoint=endpoint).inc()
    with REQUEST_LATENCY.labels(method=method, endpoint=endpoint).time():
        try:
            response = await call_next(request)
        except Exception:
            FAILURE_COUNT.labels(method=method, endpoint=endpoint).inc()
            raise
    return response

# Expose Prometheus metrics
@app.get("/metrics")
def metrics():
    data = generate_latest()
    return Response(content=data, media_type=CONTENT_TYPE_LATEST)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=3012, reload=True)