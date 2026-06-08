from fastapi import APIRouter, Depends, Header
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from schemas.auth import NonceRequest, SignInRequest
from schemas.response import APIResponse
from controllers.auth import AuthController
from databases.connection import get_db_session

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/nonce", response_model=APIResponse)
def get_nonce(request: NonceRequest, db: Session = Depends(get_db_session)):
    """
    Request a nonce message for signing.
    """
    auth_controller = AuthController(db)
    response_data, status_code = auth_controller.generate_nonce(request)
    
    return JSONResponse(status_code=status_code, content=response_data)

@router.post("/sign-in", response_model=APIResponse)
def sign_in(request: SignInRequest, db: Session = Depends(get_db_session)):
    """
    Verify Stellar wallet signature against the generated nonce and authenticate user.
    """
    auth_controller = AuthController(db)
    response_data, status_code = auth_controller.sign_in(request)
    
    return JSONResponse(status_code=status_code, content=response_data)

@router.get("/me", response_model=APIResponse)
def get_me(authorization: str | None = Header(default=None), db: Session = Depends(get_db_session)):
    """
    Get current logged in user details using Bearer token.
    """
    auth_controller = AuthController(db)
    response_data, status_code = auth_controller.get_me(authorization)
    
    return JSONResponse(status_code=status_code, content=response_data)
