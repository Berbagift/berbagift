# BagiTHR

Web3 THR (Tunjangan Hari Raya) distribution platform on Stellar.

## Contract Addresses (Stellar Testnet)

| Contract     | Address                                                           |
| ------------ | ----------------------------------------------------------------- |
| Swap         | `CDDZFRQM6OOA4EHYPUNQEDNTMCCKRERW3KNXTL556MASWIVN4X3IIAJ2`      |
| NFT Gift     | `CBTA5FRJGFZJFDJ7ASVJYSBAINF6TXE6TJMITKMOUALVFZGPGTRO2H3J`      |
| Marketplace  | `CAOC7CQDRJW6FM7BPHXQLTOSZDHB55DHXWROOD7MSM4I2TXTME5TUM3Q`      |
| Multi Room   | `CCSI6GUNOOGJHZRN2SZVD3O2QSMRSFIJ4ZEMMUU653WDKMLCZE35HKD2`      |
| RPK Token    | `CAXMJUKELFC7THVUKVH4NA5RYUDLORCKSZ5HTOPOMEXRMZJLFHKZJCQZ`      |
| XLM SAC      | `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`      |

## Architecture

```
Browser → Nginx (:8080) → Frontend (Next.js :3000)
                        → Backend (FastAPI :8000) → MySQL (:3306)
                                                   → MongoDB (:27017)
                                                   → Stellar Testnet
```

### Services

| Service     | Stack                                 |
| ----------- | ------------------------------------- |
| Frontend    | Next.js 16, Bun, Tailwind CSS v4      |
| Backend     | FastAPI, SQLAlchemy, Alembic, PyMySQL |
| Database    | MySQL 8.0                             |
| Indexer DB  | MongoDB 6.0 (MongoEngine)             |
| Reverse     | nginxinc/nginx-unprivileged:alpine    |
| DB Browser  | Adminer                               |

## Environment Variables

Copy `.env.example` to `.env` and fill in the values.

```env
# ── MySQL ──────────────────────────
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=bagithr
DB_ROOT_PASSWORD=

# ── MongoDB ─────────────────────────
MONGO_PORT=27017
MONGO_USER=root
MONGO_PASSWORD=
MONGO_DB_NAME=bagithr_indexer
MONGO_URI=mongodb://root:password@127.0.0.1:27017/bagithr_indexer?authSource=admin

# ── Backend ─────────────────────────
APP_ENV=development
BACKEND_URL=http://localhost:8000
DATABASE_URL=mysql+pymysql://root:password@db:3306/bagithr

# ── Frontend ────────────────────────
NEXT_PUBLIC_API_MODE=server
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_STELLAR_NETWORK=TESTNET
NEXT_PUBLIC_ENABLE_AUTH_MIDDLEWARE=true
NEXT_PUBLIC_SOCKET_URL=

# ── Pinata (IPFS) ───────────────────
NEXT_PUBLIC_PINATA_API_KEY=
NEXT_PUBLIC_PINATA_SECRET_API_KEY=

# ── Stellar Contracts ───────────────
SWAP_CONTRACT_ID=...
MULTI_ROOM_CONTRACT_ID=...
MARKETPLACE_CONTRACT_ID=...
NFT_GIFT_CONTRACT_ID=...
NEXT_PUBLIC_* variants of above
```

## Getting Started

### Backend

```bash
cd backend
cp .env.example .env   # edit values
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend

```bash
cd frontend
cp .env.example .env   # edit values
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

## Docker Compose

### Ports

| Environment | Nginx | Backend | Adminer |
| ----------- | ----- | ------- | ------- |
| **Dev**     | `3000` | `8000` | `8080` |
| **Staging** | `8808` | `8001`  | `8088` |
| **Prod**    | `8090` | `8000`  | `8082` |

### Root Compose (all services)

```bash
# Development
podman-compose -f docker-compose.yml up --build -d

# Staging
podman-compose -f docker-compose.staging.yml up --build -d

# Production
podman-compose -f docker-compose.prod.yml up --build -d
```

### Standalone Backend Compose

```bash
cd backend

podman-compose -f docker-compose.dev.yml up --build -d
podman-compose -f docker-compose.staging.yml up --build -d
podman-compose -f docker-compose.prod.yml up --build -d
```

### Standalone Frontend Compose

```bash
cd frontend
podman-compose -f docker-compose.staging.yml up --build -d
```
