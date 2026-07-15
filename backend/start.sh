#!/bin/sh
set -e

echo "Waiting for MySQL..."
while ! python -c "import socket; s=socket.socket(); s.settimeout(2); s.connect(('db',3306)); s.close()" 2>/dev/null; do
  sleep 1
done
echo "MySQL is reachable"

echo "Starting FastAPI..."
exec uvicorn main:app --host 0.0.0.0 --port 8000
