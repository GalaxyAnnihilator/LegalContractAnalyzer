import os
import chromadb
from openai import OpenAI
from dotenv import load_dotenv
from backend.config import CHROMA_DB_PATH
# ─── ENVIRONMENT ──────────────────────────────────────────────────────────────
load_dotenv()
API_KEY = os.getenv("OPENAI_API_KEY", "TRANMINHDUONGDEPTRAI")
BASE_URL = "https://glowing-workable-arachnid.ngrok-free.app/v1"  # or ngrok URL
openai_client = OpenAI(api_key=API_KEY, base_url=BASE_URL)

# ─── CHROMA SETUP ─────────────────────────────────────────────────────────────
chroma_client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
collection = chroma_client.get_or_create_collection("legal_docs")

# ─── EMBEDDING FUNCTION ───────────────────────────────────────────────────────
def embed_query(query_text):
    resp = openai_client.embeddings.create(
        model="Qwen3-0.6B",
        input=[query_text]
    )
    return resp.data[0].embedding

# ─── TOP-K RETRIEVAL ──────────────────────────────────────────────────────────
def query_top_k(query_text, k=5):
    query_emb = embed_query(query_text)
    results = collection.query(
        query_embeddings=[query_emb],
        n_results=k
    )
    # results['documents'] is a list of lists (one per query)
    # results['distances'] is a list of lists (one per query)
    # We'll return a list of (chunk, distance) tuples
    docs = results['documents'][0] if results['documents'] else []
    dists = results['distances'][0] if results['distances'] else []
    return list(zip(docs, dists))

# Example usage:
if __name__ == "__main__":
    q = "Sẽ ra sao nếu một trong hai bên muốn chấm dứt hợp đồng trước thời hạn?"
    top_chunks = query_top_k(q, k=3)
    for chunk, dist in top_chunks:
        print(f"Score: {dist:.4f}\n{chunk}\n{'-'*40}")
