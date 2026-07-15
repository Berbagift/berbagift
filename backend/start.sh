#!/bin/sh
set -e

echo "Waiting for MySQL (${DB_HOST:-db}:${DB_PORT:-3306})..."
python3 -c "
import socket, time, os
h = os.getenv('DB_HOST', 'db')
p = int(os.getenv('DB_PORT', '3306'))
for i in range(60):
    try:
        s = socket.socket()
        s.settimeout(2)
        s.connect((h, p))
        s.close()
        print(f'MySQL ready ({h}:{p})')
        break
    except:
        time.sleep(2)
else:
    print('TIMEOUT - starting anyway')
"

exec uvicorn main:app --host 0.0.0.0 --port 8000
