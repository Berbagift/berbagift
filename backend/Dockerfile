FROM python:3.11-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# ── dependencies ──────────────────────────────────────────────
FROM base AS deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ── development (hot-reload) ─────────────────────────────────
FROM base AS dev

COPY --from=deps /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=deps /usr/local/bin /usr/local/bin
COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# ── production ────────────────────────────────────────────────
FROM base AS prod

COPY --from=deps /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=deps /usr/local/bin /usr/local/bin
COPY . .
COPY --chmod=755 start.sh .

EXPOSE 8000
CMD ["./start.sh"]
