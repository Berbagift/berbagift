#!/bin/sh
set -e

echo "=== ENV ==="
printenv | sort
echo "==========="

echo "Waiting for MySQL..."
while ! python -c "import socket; s=socket.socket(); s.settimeout(2); s.connect(('db',3306)); s.close()" 2>/dev/null; do
  echo "Retrying in 2s..."
  sleep 2
done
echo "MySQL is ready"

exec uvicorn main:app --host 0.0.0.0 --port 8000
