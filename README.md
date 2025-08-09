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

Demo on Render: https://legalcontractanalyzer.onrender.com/

### Monitoring and Visualization with Prometheus + Grafana:

![Prometheus](./figures/prometheus.png)

![Grafana](./figures/grafana.png)

## Features

- [X] Upload your legal contracts in PDF format.
- [X] RAG Chatbot interface.
- [X] Supabase file storage..
- [X] Real-time streaming response.
- [X] Contextual retrieving + querying via ChromaDB.
- [X] CI pipeline with Github Actions.
- [ ] CD pipeline with HuggingFace Space.
- [X] Monitoring with Prometheus & Grafana.
- [ ] Evaluation of the system (automated tests, LLM-as-judge).


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

1. Build the services:

```bash
docker compose build .
```

2. Run all the services

```bash
docker compose up -d
```

3. Access the web app frontend at: http://localhost:8080

Start by uploading a file then ask a question like: "Thời hạn hợp đồng kéo dài trong bao lâu?"

4. Acces the monitoring Grafana at: http://localhost:3000 

*Note*: Username / password for Grafana should be admin / admin, go to Dashboards and select the panel to view metrics

5. Other ports if you're interested:

Backend: http://localhost:3012

Prometheus: http://localhost:9090

## API Endpoints

Available endpoints for backend:

|Methods|Functionality|
|:------|:----------:|
|POST /upload_pdf| Uploads and stores PDF |
|POST /retrieve_documents | Downloads all files from Supabase|
|POST /ingest             | Embeds and stores chunks
|POST /query              | Retrieves top-K chunks for a query
|POST /rag_chat           | Full chat with RAG streaming
|GET  /api_key            | Exposes env vars (for dev)

## Monitoring

In Grafana, I've built a dedicated **Queries Dashboard** to give you real-time insights into your RAG chatbot’s performance and reliability. Here’s what you’ll see:

| **Metrics**| **Description**| **Usage / Use Case**|
|------------|---------------|----------------------|
| **Request Throughput (QPS)**      | Time-series graph showing how many RAG queries per second your service handles.| Spot usage spikes or drops in real-time.|
| **Total Requests Over Time**      | Cumulative counter showing the growth of total user queries.| Understand long-term trends in user activity.|
| **Failure Rate**                  | Gauge or line panel showing percentage of failed RAG calls (errors ÷ total queries).                             | Highlight reliability issues and monitor service health.|
| **Average Latency**               | Single-stat or time-series panel showing average end-to-end response time.     | Track baseline performance and detect slowdowns.|
| **Latency Percentiles** (p50, p95, p99) | Overlayed lines for median, 95th, and 99th percentile response times.| Monitor tail latencies and ensure SLO compliance.     |
| **Latency Distribution Heatmap**  | Heatmap visualizing full latency bucket distribution.   | See response time spread and detect performance outliers.|

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

