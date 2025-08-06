# Legal Contract Analyzer
A MLOps project of an AI-powered RAG Chatbot for understanding and querying legal documents. Together with CI/CD, monitoring and visualization.

## Table of contents
- [Overview](#overview)
- [Demo](#demo)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Monitoring](#monitoring)
- [Project Structure](#project-structure)
- [License](#license)
- [Acknowledgements](#acknowledgements)

## Overview

This project is about creating a Retrieval Augmented Generation (RAG) System that can understand your legal documentations (housing contracts, work contracts, etc). I built it for fun, aiming to expand my knowledge in AI Engineering, MLOps, NLP.

With the power of RAG, the answers are now more precise, the LLM experiences less hallucination thanks to the retrieved contexts. This is crucial when dealing with legal documents.

## Demo

![Quick Preview](./figures/demo.gif)

[Watch the full demo video](https://youtu.be/kvJwAMWmvj0)

### Monitoring and Visualization with Prometheus + Grafana:

![Prometheus](./figures/prometheus.png)

![Grafana](./figures/grafana.png)

## Features

- [X] Upload your legal contracts in PDF format.
- [X] RAG Chatbot interface.
- [X] Supabase file storage..
- [X] Real-time streaming response.
- [X] Contextual retrieving + querying via ChromaDB.
- [X] Monitoring with Prometheus & Grafana.
- [ ] CI/CD Pipeline.
- [ ] Evaluation of the system (hallucination metrics, etc).
- [ ] Monitoring.


## Tech Stack

- Backend: FastAPI, OpenAI, FastChat, vLLM
- Frontend: HTML, CSS, JS
- Database: Supabase for PDFs, ChromaDB for vector database
- Model: [Qwen3-0.6B](https://huggingface.co/Qwen/Qwen3-0.6B) for both chat and embeddings
- Monitoring & Visualization: Prometheus & Grafana
- CI/CD Pipeline: Github Actions, Docker, HuggingFace space for deployment

## Architecture

### RAG Pipeline:

![](./figures/RAG_pipeline.png)

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

### Docker Compose (App + Monitoring)

A **docker-compose.yml** is provided to run all the services together.

```yml
services:
  app:
    build: .
    container_name: rag_app
    ports:
      - "3012:3012"
      - "8080:8080"
    environment:
      - OPENAI_API_KEY=<your_key>
      - SUPABASE_URL=<your_supabase_url>
      - SUPABASE_KEY=<your_supabase_key>

  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    depends_on:
      - prometheus
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/datasources:/etc/grafana/provisioning/datasources
      - ./monitoring/dashboards/providers.yml:/etc/grafana/provisioning/dashboards/providers.yml:ro
      - ./monitoring/dashboards/rag_dashboard.json:/var/lib/grafana/dashboards/rag_dashboard.json:ro
    ports:
      - "3000:3000"

volumes:
  prometheus_data:
  grafana_data:
```

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

## Monitoring

In Grafana, I've built a dedicated Queries Dashboard to give you real-time insights into your RAG chatbot’s performance and reliability. Here’s what you’ll see:

1. **Request Throughput (QPS)**
- A time-series graph showing how many RAG queries per second your service handles, so you can spot usage spikes or drops.

2. **Total Requests Over Time**
- Cumulative counter displaying the growth of total user queries, helping you understand long-term trends.

3. **Failure Rate**
- A gauge or line panel showing the percentage of failed RAG calls (errors divided by total queries), highlighting reliability issues.

4. **Average Latency**
- A single-stat or time-series panel showing the average end-to-end response time, so you can track baseline performance.

5. **Latency Percentiles** (p50, p95, p99)
- Overlayed lines for median, 95th, and 99th percentile response times, which help you monitor your tail latencies and SLOs.

6. **Latency Distribution Heatmap**
- A heatmap visualizing the full latency bucket distribution, so you can see how response times spread across buckets and detect outliers.


=> All of these panels live in one dashboard, giving us a consolidated MLOps view of traffic, errors, and performance for our app.

## Project Structure
```bash
├── backend/
│   ├── chroma_vector_db/
│   ├── downloaded_pdfs/
│   ├── config.py
│   ├── ingest.py
│   ├── main.py
│   ├── query.py
│   ├── retrieve_documents.py
│   ├── test_backend.py
│   └── visualize_chroma.py
│
├── figures/
├── frontend/
│   ├── chat.js
│   ├── file_manager.js
│   ├── get_api_keys.js
│   ├── index.html
│   ├── script.js
│   └── style.css
├── monitoring/
│   ├── prometheus.yml
│   ├── datasources/
│   │   └── prometheus.yml
│   └── dashboards/
│       ├── providers.yml
│       └── rag_dashboard.json
├── .dockerignore
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── LICENSE
├── README.md
└── requirements.txt
```

## Licence

[Apache 2.0](./LICENSE)

## Acknowledgement

[@sleepysaki](https://github.com/sleepysaki) for DevOps guidance
