#!/bin/sh
set -e

wait_tcp() {
  host="$1"
  port="$2"
  echo "Waiting for TCP ${host}:${port}..."
  while ! python -c "import socket; s=socket.socket(); s.settimeout(2); s.connect(('${host}',${port})); s.close()" 2>/dev/null; do
    sleep 2
  done
  echo "${host}:${port} is reachable"
}

wait_tcp "${DB_HOST:-db}" "${DB_PORT:-3306}"

if [ -n "$MONGO_URI" ]; then
  echo "Waiting for MongoDB..."
  while ! python -c "from pymongo import MongoClient; MongoClient('$MONGO_URI', serverSelectionTimeoutMS=2000).admin.command('ping')" 2>/dev/null; do
    sleep 2
  done
  echo "MongoDB is ready"
fi

echo "Starting FastAPI..."
exec uvicorn main:app --host 0.0.0.0 --port 8000
