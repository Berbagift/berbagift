# Backend Progress Tracker

## 🚀 Project Milestones
- [x] **Phase 1**: Initialized FastAPI backend with strict architecture (`controllers/`, `routes/`, `schemas/`).
- [x] **Phase 2**: Standardized API responses (200, 201, 400, 404, 409, 500) following `RULES.md`.
- [x] **Phase 3**: Integrated MySQL using SQLAlchemy and PyMySQL.
- [x] **Phase 4**: Configured database connection using `.env` and `DatabaseConnection` class logic.
- [x] **Phase 5**: Created `User` model with strict validation limits (`username` max 50 chars, `email` max 100 chars, `wallet_address` max 56 chars).
- [x] **Phase 6**: Refactored authentication to use the secure **Sign-In With Stellar (SIWS)** pattern (Challenge-Response).
  - Created `Nonce` model and `/api/auth/nonce` to generate temporary challenges.
  - Built `/api/auth/sign-in` to verify signatures mathematically against the saved nonces to prevent replay attacks.
  - Nonces are automatically expired or deleted upon successful use.
  - API responses strictly comply with **Rule 1.2 (Standard Format Response)**: 400 errors now correctly return field-level JSON objects (e.g. `{"wallet_address": "..."}`) instead of flat strings, mapping exactly to the `RULES.md` spec.
  - **Strict Status & Error Codes Enforcement**: Audited and fixed `auth.py` to rigorously follow `RULES.md`. POST endpoints (`/nonce`, `/sign-in`) now correctly return `201 Created` on success instead of `200`. Error messages inside the `errors` dictionary now utilize standardized code strings (e.g., `IS_INVALID`) rather than unstructured text.
  - **Global Validation Override**: Overrode FastAPI's default `422 Unprocessable Entity` for request validation to emit `400 Bad Request` strictly matching Rule 1.2.2 (returning `IS_REQUIRED` for missing fields).
  - **Bugfix (Auth Signature)**: Updated signature verification logic in `auth.py` to properly hash the prefixed payload (`Stellar Signed Message:\n`) with `SHA-256` before verification, matching Freighter's internal Ed25519 payload specification. Added fallback mechanism to support raw data verification.
  - **User Registration Update**: Refactored the `User` model to make the `email` field `nullable=True` (migrated via Alembic) and updated `auth.py`/`databases/user.py` to leave the email empty (`None`) during initial wallet sign-in, preventing default dummy data insertion.
- [x] **Phase 7**: Standardized Data Models (`TimestampMixin` & Soft Deletes).
  - Created a universal `TimestampMixin` in `models/base.py` providing `created_at`, `updated_at`, and `deleted_at` (soft delete marker).
  - Updated all models (`User`, `Nonce`) to inherit from the mixin, reducing boilerplate.
  - Adapted database queries (`get_user_by_wallet`, `get_nonce`) to automatically filter out soft-deleted records (`deleted_at.is_(None)`).
  - Replaced hard database deletions with soft deletions (e.g. `existing.deleted_at = datetime.utcnow()`).
  - Follows "Clean Code" principles (SRP, reducing repetitive field declarations) and "Security Review" guidelines (preserving soft-deleted data).
- [x] **Phase 8**: JWT Access Token implementation using Asymmetric Cryptography (RS256).
  - Generated secure RSA keypairs (`private.pem`, `public.pem`) in `keys/` directory.
  - Implemented automatic key generation fallback inside `utils/jwt.py` using the `cryptography` library. If keys are missing (e.g. fresh clone), they will be securely generated on server startup.
  - Implemented `utils/jwt.py` utility for encoding/decoding JWTs via PyJWT using RS256 algorithm.
  - Integrated `create_access_token` into `/api/auth/sign-in` endpoint, returning an `access_token` inside the standardized response envelope `data` field upon successful login.
  - Adhered strictly to `RULES.md` and "Security Review" skill by avoiding symmetric/hardcoded secrets and prioritizing cryptographic keys.
- [x] **Phase 9**: CORS & Soft Delete Bugfixes.
  - Relaxed CORS in `main.py` to `allow_origins=["*"]` and `allow_credentials=False` to handle frontend requests dynamically without hardcoded localhost origins.
  - **Bugfix (Nonce DB)**: Fixed unique constraint errors when a wallet address attempts to re-authenticate after its previous nonce was soft-deleted. The `upsert_nonce` method now correctly restores a soft-deleted nonce by setting `deleted_at = None`.
- [x] **Phase 10**: User Profile API (`/api/auth/me`).
  - Implemented the `GET /api/auth/me` endpoint to fetch the current authenticated user's details.
  - Added `get_user_by_id` method to `UserDatabase` with built-in soft-delete filtering.
  - Implemented manual Bearer token extraction and JWT validation in `AuthController.get_me()`.
  - Added specific JWT exception handling for `ExpiredSignatureError` and `InvalidTokenError`.
  - Configured invalid authentication responses to strictly return `401 Unauthorized` with an empty `errors` field (`null`), separating it from the `400 Bad Request` validation structure.

## 🏗️ Architecture & Context
- **Framework**: FastAPI (Sync logic currently, standard routing).
- **Database ORM**: SQLAlchemy with PyMySQL driver.
- **Classes**: All controllers and database connectors are wrapped in classes to strictly comply with `RULES.md` section 2.1.
- **Auto Migrate (Alembic)**: Instead of basic `create_all()`, the backend is fully integrated with Alembic for safe database schema migrations. A programmatic auto-migration is triggered upon server startup via `command.upgrade(alembic_cfg, "head")` inside `main.py`, ensuring the database schema is always up-to-date with the models without manual intervention.
