# visualize_chroma.py
# Connects to your ChromaDB and saves chunks + embeddings into a CSV

import chromadb
import pandas as pd
from chromadb.config import Settings

client = chromadb.PersistentClient(path="./chroma_vector_db")
collection = client.get_collection("legal_docs")

res = collection.get(include=["documents", "embeddings"])

records = []
for idx, doc_text in enumerate(res["documents"]):
    records.append({
        "id": res["ids"][idx],
        "chunk": doc_text,
        "embedding": res["embeddings"][idx]
    })

df = pd.DataFrame(records)

# Save DataFrame to CSV
csv_path = "chroma_chunks_and_embeddings.csv"
df.to_csv(csv_path, index=False)
print(f"✅ CSV saved to {csv_path}")