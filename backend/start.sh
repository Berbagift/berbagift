#!/bin/sh
set -e
echo "Starting FastAPI..."
exec uvicorn main:app --host 0.0.0.0 --port 8000
