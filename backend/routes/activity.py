from fastapi import APIRouter, Depends, Header
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from databases.connection import get_db_session
from schemas.response import APIResponse
from controllers.activity import ActivityController

router = APIRouter(prefix="/api/activities", tags=["activities"])

@router.get("", response_model=APIResponse)
def get_activities(
    limit: int = 50, 
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db_session)
):
    activity_controller = ActivityController(db)
    response_data, status_code = activity_controller.get_activities(authorization, limit)
    return JSONResponse(status_code=status_code, content=response_data)
