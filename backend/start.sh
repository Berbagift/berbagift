#!/bin/sh
set -e

echo "=== ENV ==="
printenv | sort
echo "==========="

DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-3306}"

echo "Waiting for MySQL (${DB_HOST}:${DB_PORT})..."
python -c "
import socket, time, os
host = os.getenv('DB_HOST', 'db')
port = int(os.getenv('DB_PORT', '3306'))
for i in range(60):
    try:
        s = socket.socket()
        s.settimeout(2)
        s.connect((host, port))
        s.close()
        print(f'MySQL is ready ({host}:{port})')
        break
    except Exception as e:
        print(f'({i+1}s) waiting for {host}:{port}...')
        time.sleep(1)
"

exec uvicorn main:app --host 0.0.0.0 --port 8000
