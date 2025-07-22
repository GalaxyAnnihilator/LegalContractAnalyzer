from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

import os
import shutil
from backend.retrieve_documents import download_all_files
from backend.ingest import ingest_all
from backend.query import query_top_k
from dotenv import dotenv_values

app = FastAPI()

UPLOAD_FOLDER = "downloaded_pdfs"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Allow all origins (dev only)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 🔥 In production, set this to your frontend domain
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

@app.get("/api_key")
def expose_api_key():
    keys = dotenv_values("../.env")
    return keys        

@app.get("/")
def root():
    return {"message": "Backend API is running <3. Try /upload_pdf , /retrieve_documents , /ingest, /query"}

if __name__ == "__main__":
    os.system("uvicorn main:app --reload --host 0.0.0.0 --port 3012")
