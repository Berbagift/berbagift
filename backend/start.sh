#!/bin/sh
set -e

echo "Waiting for MySQL to be ready..."
until python -c "
import os, pymysql
try:
    pymysql.connect(
        host=os.getenv('DB_HOST', 'db'),
        port=int(os.getenv('DB_PORT', 3306)),
        user=os.getenv('DB_USER', 'root'),
        password=os.getenv('DB_PASSWORD', ''),
        database=os.getenv('DB_NAME', 'bagithr'),
    )
    print('DB ready!')
    exit(0)
except Exception as e:
    print(f'DB not ready: {e}')
    exit(1)
"; do
    echo "Retrying in 3s..."
    sleep 3
done

echo "Running Alembic migrations..."
alembic upgrade head

echo "Starting FastAPI..."
exec uvicorn main:app --host 0.0.0.0 --port 8000
