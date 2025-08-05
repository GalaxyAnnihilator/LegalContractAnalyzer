# Legal Contract Analyzer
An AI-powered RAG Chatbot for understanding and querying legal documents.

## Table of contents
- [Overview](#overview)
- [Demo](#demo)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [License](#license)
- [Acknowledgements](#acknowledgements)

## Overview

This project is about creating a Retrieval Augmented Generation (RAG) System that can understand your legal documentations (housing contracts, work contracts, etc). I built it for fun, aiming to expand my knowledge in AI Engineering, MLOps, NLP.

With the power of RAG, the answers are now more precise, the LLM experiences less hallucination thanks to the retrieved contexts. This is crucial when dealing with legal documents.

## Demo

![Demo](./figures/demo.gif)

[Watch the video](https://youtu.be/kvJwAMWmvj0)

## Features

- [&check;] Upload your legal contracts in PDF format.
- [&check;] RAG Chatbot interface.
- [&check;] Supabase file storage..
- [&check;] Real-time streaming response.
- [&check;] Contextual retrieving + querying via ChromaDB.
- [ ] CI/CD Pipeline.
- [ ] Evaluation of the system (hallucination metrics, etc).
- [ ] Monitoring.


## Tech Stack

- Backend: FastAPI, OpenAI, FastChat, vLLM
- Frontend: HTML, CSS, JS
- Database: Supabase for pdf files, ChromaDB for vector database
- Model: [Qwen3-0.6B](https://huggingface.co/Qwen/Qwen3-0.6B) for both chat and embeddings
- CI/CD Pipeline: Github Actions, Docker, HuggingFace space for deployment

## Architecture

### RAG Pipeline:

![](./figures/RAG_pipeline.svg)

## Getting Started

### Clone the repository

```shell
git clone https://github.com/GalaxyAnnihilator/LegalContractAnalyzer

cd LegalContractAnalyzer
```

### Download dependencies

```python
pip install -r requirements.txt
```

### Start up your backend
Use either of these commands:

```python
PYTHONPATH=. python ./backend/main.py
```

or 

```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 3012
```

### Access your frontend

Copy the path of the index.html file and paste it into your browser

or

```python
python -m http.server 8080 --directory frontend
```

### Docker image

(coming soon)

## API Endpoints

Available endpoints for backend:

|Methods|Functionality|
|:------|:----------:|
|POST /upload_pdf| Uploads and stores PDF |
|POST /retrieve_documents | Downloads all files from Supabase|
|POST /ingest             | Embeds and stores chunks
|POST /query              | Retrieves top-K chunks for a query
|POST /rag_chat           | Full chat with RAG streaming
GET  /api_key            | Exposes env vars (for dev)

## Project Structure
```bash
├── backend/
│   ├── chroma_vector_db/
|   ├── downloaded_pdfs/
│   ├── config.py
│   ├── ingest.py
│   ├── main.py
│   ├── query.py
│   ├── retrieve_documents.py
│   ├── test_backend.py
│   └── visualize_chroma.py
|
├── figures/
├── frontend/
│   ├── chat.js
│   ├── file_manager.js
│   ├── get_api_keys.js
│   ├── index.html
│   ├── script.js
│   └── style.css
├── .dockerignore
├── .gitignore
├── Dockerfile
├── LICENSE
├── README.md
└── requirements.txt
```

## Licence

[Apache 2.0](./LICENSE)

## Acknowledgement

[@sleepysaki](https://github.com/sleepysaki) for DevOps aspect of this project
