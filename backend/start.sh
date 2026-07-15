#!/bin/sh
set -e

echo "Waiting for MySQL..."
MAX_WAIT=120
WAITED=0
while [ $WAITED -lt $MAX_WAIT ]; do
  if python -c "import socket; s=socket.socket(); s.settimeout(2); s.connect(('db',3306)); s.close()" 2>/dev/null; then
    echo "MySQL is reachable"
    break
  fi
  sleep 2
  WAITED=$((WAITED + 2))
  echo "Still waiting... ${WAITED}s"
done

if [ $WAITED -ge $MAX_WAIT ]; then
  echo "ERROR: MySQL not reachable after ${MAX_WAIT}s"
  exit 1
fi

echo "Starting FastAPI..."
exec uvicorn main:app --host 0.0.0.0 --port 8000
