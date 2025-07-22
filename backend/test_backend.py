import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root():
    resp = client.get("/")
    assert resp.status_code == 200
    assert "Backend API is running" in resp.json()["message"]

def test_upload_pdf():
    # Create a dummy PDF file
    filename = "test_upload.pdf"
    content = b"%PDF-1.4 test pdf content"
    files = {"file": (filename, content, "application/pdf")}
    resp = client.post("/upload_pdf", files=files)
    assert resp.status_code == 200
    assert resp.json()["filename"] == filename
    assert resp.json()["status"] == "uploaded"

def test_query_no_message():
    payload = {"messages": []}
    resp = client.post("/query", json=payload)
    assert resp.status_code == 500
    assert "No user message found" in resp.json()["detail"]

def test_query_with_message(monkeypatch):
    # Patch query_top_k to avoid real DB/embedding calls
    from main import query_top_k
    monkeypatch.setattr("main.query_top_k", lambda msg, k=3: [("chunk1", 0.1), ("chunk2", 0.2)])
    payload = {"messages": [{"role": "user", "content": "test question"}]}
    resp = client.post("/query", json=payload)
    assert resp.status_code == 200
    assert resp.json()["status"].startswith("Success")
    assert len(resp.json()["chunks"]) == 2
    assert resp.json()["chunks"][0]["text"] == "chunk1"

def test_ingest(monkeypatch):
    monkeypatch.setattr("main.ingest_all", lambda path: None)
    resp = client.post("/ingest")
    assert resp.status_code == 200
    assert "Ingestion complete" in resp.json()["status"]

def test_retrieve_documents(monkeypatch):
    monkeypatch.setattr("main.download_all_files", lambda path: None)
    resp = client.post("/retrieve_documents")
    assert resp.status_code == 200
    assert "Retrieval of documents" in resp.json()["status"]
