FROM python:3.10-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Install build dependencies only if needed (optional)
# RUN apt-get update && apt-get install -y --no-install-recommends build-essential && rm -rf /var/lib/apt/lists/*

# Copy only requirements first (cacheable layer)
COPY requirements.txt .

# Install backend dependencies (cached if requirements.txt hasn't changed)
RUN --mount=type=cache,target=/root/.cache \
    pip install -r requirements.txt

# Now copy the rest of the application
COPY . .

# Expose backend and frontend ports
EXPOSE 3012 8080

# Start both backend and frontend
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port 3012 & python3 -m http.server 8080 --directory frontend"]
