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

@router.get("/inbox", response_model=APIResponse)
def get_inbox(
    limit: int = 50, 
    category: str | None = None,
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db_session)
):
    activity_controller = ActivityController(db)
    response_data, status_code = activity_controller.get_inbox(authorization, limit, category)
    return JSONResponse(status_code=status_code, content=response_data)


import asyncio
from fastapi import Request

@router.get("/poll", response_model=APIResponse)
async def poll_activities(
    request: Request,
    last_count: int = 0,
    limit: int = 50, 
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db_session)
):
    activity_controller = ActivityController(db)
    
    for _ in range(30):
        if await request.is_disconnected():
            break
            
        response_data, status_code = activity_controller.get_activities(authorization, limit)
        if status_code != 200:
            return JSONResponse(status_code=status_code, content=response_data)
            
        current_count = len(response_data["data"]) if response_data["data"] else 0
        if current_count > last_count or last_count == 0:
            return JSONResponse(status_code=status_code, content=response_data)
            
        await asyncio.sleep(1)
        
    return JSONResponse(status_code=status_code, content=response_data)

@router.get("/inbox/poll", response_model=APIResponse)
async def poll_inbox(
    request: Request,
    last_count: int = 0,
    limit: int = 50, 
    category: str | None = None,
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db_session)
):
    activity_controller = ActivityController(db)
    
    for _ in range(30):
        if await request.is_disconnected():
            break
            
        response_data, status_code = activity_controller.get_inbox(authorization, limit, category)
        if status_code != 200:
            return JSONResponse(status_code=status_code, content=response_data)
            
        items = response_data.get("data", {}).get("items", [])
        current_count = len(items)
        if current_count > last_count or last_count == 0:
            return JSONResponse(status_code=status_code, content=response_data)
            
        await asyncio.sleep(1)
        
    return JSONResponse(status_code=status_code, content=response_data)

from schemas.activity import UpdateInboxRequest, MarkAllReadRequest

@router.patch("/inbox/{activity_id}", response_model=APIResponse)
def update_inbox_item(
    activity_id: str,
    payload: UpdateInboxRequest,
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db_session)
):
    activity_controller = ActivityController(db)
    response_data, status_code = activity_controller.update_inbox_item(authorization, activity_id, {"read": payload.read})
    return JSONResponse(status_code=status_code, content=response_data)

@router.post("/inbox/mark-all-read", response_model=APIResponse)
def mark_all_read(
    payload: MarkAllReadRequest,
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db_session)
):
    activity_controller = ActivityController(db)
    response_data, status_code = activity_controller.mark_all_read(authorization, payload.category)
    return JSONResponse(status_code=status_code, content=response_data)
