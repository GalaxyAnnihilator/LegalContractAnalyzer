FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Rest of the code
COPY . .

# Install backend dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose backend and frontend ports
EXPOSE 3012 8080

# Start both backend (FastAPI) and serve frontend (using Python's http.server)
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port 3012 & python3 -m http.server 8080 --directory frontend"]
