from fastapi import FastAPI
from routes.hello import router as hello_router
from routes.auth import router as auth_router
from routes.token import router as token_router
from schemas.response import APIResponse
from databases.connection import engine
from models.base import Base
# Import all models to ensure they are registered with the Base
import models.user
import models.nonce
from alembic import command
from alembic.config import Config
from fastapi.responses import PlainTextResponse
from schemas.indodax import IndodaxCallbackPayload
from services.indodax import validate_withdrawal_request

# Auto migrate on startup
alembic_cfg = Config("alembic.ini")
command.upgrade(alembic_cfg, "head")

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="BagiTHR API",
    description="Backend API using FastAPI",
    version="1.0.0"
)

# Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.exceptions import RequestValidationError
from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = {}
    for error in exc.errors():
        field = str(error["loc"][-1])
        # Use IS_REQUIRED or similar messages based on the error type
        if error["type"] == "missing":
            errors[field] = "IS_REQUIRED"
        else:
            errors[field] = error["msg"]

    return JSONResponse(
        status_code=400,
        content={
            "message": "gagal memproses permintaan",
            "data": None,
            "errors": errors
        }
    )

# Include routes
app.include_router(hello_router)
app.include_router(auth_router)
app.include_router(token_router)

@app.get("/", response_model=APIResponse, status_code=200)
def root():
    return {
        "message": "Welcome to BagiTHR API",
        "data": None,
        "errors": None
    }

@app.post("/indodax-callback", response_class=PlainTextResponse)
async def indodax_withdraw_callback(payload: IndodaxCallbackPayload):
    """
    Webhook endpoint untuk Indodax Withdrawal Callback.
    Wajib mengembalikan plain text 'ok' jika validasi berhasil.
    """
    is_valid = await validate_withdrawal_request(payload)
    
    if is_valid:
        # Indodax hanya akan melanjutkan proses jika menerima string "ok" (tanpa kutip) [cite: 312, 313]
        return "ok"
    
    # Jika gagal validasi, kembalikan HTTP status error (misal 400 Bad Request)
    raise HTTPException(status_code=400, detail="Validasi data withdrawal gagal")
