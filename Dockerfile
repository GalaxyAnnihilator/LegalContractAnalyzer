FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1
    
WORKDIR /app
COPY . . 
RUN pip install --no-cache-dir gradio
EXPOSE 7860
CMD ["python", "app.py"]
