#!/bin/sh
set -e

echo "=== ENV ==="
printenv | sort
echo "==========="

echo "Waiting for MySQL..."
python -c "
import socket, time, os
host = os.getenv('DB_HOST', 'db')
for i in range(60):
    try:
        s = socket.socket()
        s.settimeout(2)
        s.connect((host, 3306))
        s.close()
        print('MySQL is ready')
        break
    except Exception as e:
        print(f'({i+1}s) waiting for {host}:3306...')
        time.sleep(1)
"

exec uvicorn main:app --host 0.0.0.0 --port 8000
