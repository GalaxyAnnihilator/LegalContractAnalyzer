#!/bin/bash

# ==============================
# Customizable parameters
# ==============================
CHAT_MODEL_PATH=${1:-Qwen/Qwen3-0.6B}                # First argument or default
CHAT_MODEL_NAME=${2:-Qwen3-0.6B}                     # Second argument or default
CHAT_PORT=${3:-21002}

EMBED_MODEL_PATH=${4:-Qwen/Qwen3-Embedding-0.6B}     # Fourth argument or default
EMBED_MODEL_NAME=${5:-Qwen3-Embedding-0.6B}          # Fifth argument or default
EMBED_PORT=${6:-21003}

API_PORT=${7:-8000}
NGROK_URL=${8:-https://example-tunnel.ngrok-free.app} # Eighth argument or default

# ==============================
# Start services
# ==============================
echo "Starting controller..."
nohup python3 -m fastchat.serve.controller \
    --host localhost \
    --port 21001 \
    > controller.log 2>&1 &
sleep 3

echo "Starting $CHAT_MODEL_NAME worker..."
nohup python3 -m fastchat.serve.model_worker \
    --model-path "$CHAT_MODEL_PATH" \
    --model-name "$CHAT_MODEL_NAME" \
    --host localhost \
    --port $CHAT_PORT \
    --worker-address "http://localhost:$CHAT_PORT" \
    --controller-address http://localhost:21001 \
    > worker_chat.log 2>&1 &
sleep 5

echo "Starting $EMBED_MODEL_NAME worker..."
nohup python3 -m fastchat.serve.model_worker \
    --model-path "$EMBED_MODEL_PATH" \
    --model-name "$EMBED_MODEL_NAME" \
    --host localhost \
    --port $EMBED_PORT \
    --worker-address "http://localhost:$EMBED_PORT" \
    --controller-address http://localhost:21001 \
    > worker_embed.log 2>&1 &
sleep 5

echo "Starting OpenAI API server on port $API_PORT..."
nohup python3 -m fastchat.serve.openai_api_server \
    --host 0.0.0.0 \
    --port $API_PORT \
    --controller-address http://localhost:21001 \
    --allowed-origins '["*"]' \
    > api_server.log 2>&1 &

echo "✅ All servers started!"
echo "Logs: controller.log, worker_chat.log, worker_embed.log, api_server.log"

# ==============================
# Start ngrok tunnel
# ==============================
while true; do
  ngrok http $API_PORT --url "$NGROK_URL" --log=stdout
  echo "ngrok exited unexpectedly, restarting in 5s…" >&2
  sleep 5
done