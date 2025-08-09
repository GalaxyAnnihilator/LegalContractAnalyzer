# backend/query.py
import numpy as np
import chromadb
from openai import OpenAI
from dotenv import load_dotenv
from backend.config import CHROMA_DB_PATH
import os

load_dotenv()
API_KEY = os.getenv("OPENAI_API_KEY")
BASE_URL = os.getenv("FASTCHAT_URL", "https://glowing-workable-arachnid.ngrok-free.app/v1")
openai_client = OpenAI(api_key=API_KEY, base_url=BASE_URL)

chroma_client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
collection = chroma_client.get_or_create_collection("legal_docs")

def embed_texts(texts):
    resp = openai_client.embeddings.create(
        model="Qwen3-0.6B",
        input=texts
    )
    # ensure order
    return [item.embedding for item in sorted(resp.data, key=lambda d: d.index)]

def normalize(vec):
    arr = np.array(vec, dtype=np.float32)
    return arr / (np.linalg.norm(arr) + 1e-10)

def query_top_k(query_text, k=10, rerank_top_n=5):
    # 1) embed
    q_emb = embed_texts([query_text])[0]
    q_norm = normalize(q_emb)

    # 2) dense retrieval (get more candidates)
    results = collection.query(query_embeddings=[q_emb], n_results=k)
    docs = results.get('documents', [[]])[0]
    dists = results.get('distances', [[]])[0]

    # Note: Chroma distances are lower = better. We'll compute cosine from stored embeddings if available.
    # If you stored embeddings in collection, pull them (some Chroma versions allow include=['embeddings'])
    # Here we fallback to converting distance -> similarity (if the metric is cosine)
    sims = []
    for idx, doc in enumerate(docs):
        # try to get the stored embedding if available:
        try:
            emb = results['embeddings'][0][idx]
            sim = float(np.dot(q_norm, normalize(emb)))
        except Exception:
            # fallback: invert distance (only approximate)
            dist = dists[idx] if idx < len(dists) else 1.0
            sim = 1.0 - float(dist)
        sims.append((doc, sim))

    # sort by similarity desc
    sims.sort(key=lambda x: x[1], reverse=True)

    # optional: rerank top candidates with a cross-encoder here

    return sims[:rerank_top_n]  # return top rerank_top_n with similarity


# Example usage:
if __name__ == "__main__":
    q = "An interesting fact about the humming bird"
    top_chunks = query_top_k(q, k=3)
    for chunk, dist in top_chunks:
        print(f"Score: {dist:.4f}\n{chunk}\n{'-'*40}")
