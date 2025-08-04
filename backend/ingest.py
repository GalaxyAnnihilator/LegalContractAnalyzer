import os
import pdfplumber
import re
import uuid
import chromadb
from openai import OpenAI
from dotenv import load_dotenv
from backend.config import CHROMA_DB_PATH

# ─── 1) ENVIRONMENT ──────────────────────────────────────────────────────────────
load_dotenv()
API_KEY = os.getenv("OPENAI_API_KEY", "TRANMINHDUONGDEPTRAI")
BASE_URL = "https://glowing-workable-arachnid.ngrok-free.app/v1"  # or ngrok URL
openai_client = OpenAI(api_key=API_KEY, base_url=BASE_URL)

# ─── 2) CHROMA SETUP ─────────────────────────────────────────────────────────────
chroma_client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
collection = chroma_client.get_or_create_collection("legal_docs")

# ─── 3) CHUNKING UTILITIES ───────────────────────────────────────────────────────
import re

def chunk_text_by_sentences(text, max_chars=1000, overlap_sentences=1):
    """
    Splits `text` on sentence boundaries, then bundles sentences
    into ~max_chars chunks with a bit of overlap.
    """
    sentences = re.split(r'(?<=[.!?])\s+', text)
    chunks = []
    current = []
    char_count = 0

    for sent in sentences:
        sent_len = len(sent) + 1  # +1 for space/newline
        # if adding this sentence will exceed max_chars:
        if char_count + sent_len > max_chars:
            chunks.append(" ".join(current))
            # start new chunk, but include the last few sentences as overlap
            current = current[-overlap_sentences:]
            char_count = sum(len(s)+1 for s in current)
        current.append(sent)
        char_count += sent_len

    if current:
        chunks.append(" ".join(current))

    return chunks

def chunk_paragraph(paragraph):
    return chunk_text_by_sentences(paragraph, max_chars=1200, overlap_sentences=1)
    # or: return chunk_text_by_chars(paragraph, max_chars=1200, overlap=200)

# ─── 4) EMBEDDING VIA OPENAI ────────────────────────────────────────────────────
def embed_via_openai(text_chunks):
    resp = openai_client.embeddings.create(
        model="Qwen3-0.6B",
        input=text_chunks
    )
    # resp.data is a list of objects with .index and .embedding
    sorted_items = sorted(resp.data, key=lambda d: d.index)
    return [item.embedding for item in sorted_items]

# ─── 5) PDF INGESTION ────────────────────────────────────────────────────────────
def ingest_pdf(pdf_path):
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            text += page_text + "\n\n" if page_text else ""
    # split into paragraphs:
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]

    all_chunks = []
    for para in paragraphs:
        all_chunks.extend(chunk_paragraph(para))

    if not all_chunks:
        return

    embs = embed_via_openai(all_chunks)
    ids  = [uuid.uuid4().hex for _ in all_chunks]
    collection.add(documents=all_chunks, embeddings=embs, ids=ids)

def ingest_all(pdf_dir):
    for fn in os.listdir(pdf_dir):
        if fn.lower().endswith(".pdf"):
            ingest_pdf(os.path.join(pdf_dir, fn))

if __name__ == "__main__":
    ingest_all("./downloaded_pdfs")
    print("✅ Ingestion complete.")
