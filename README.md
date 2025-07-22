# LegalContractAnalyzer
A RAG Chatbot that analyzes your contracts

# Start up your backend
Use either of these commands:

```python
PYTHONPATH=. python ./backend/main.py
```

or 

```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 3012
```

# Access your frontend

Go straight to the index.html file

or
```python
python -m http.server 8080 --directory frontend
```