with open("backend/routes/activity.py", "r") as f:
    content = f.read()

poll_routes = """
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
"""

if "def poll_activities(" not in content:
    content = content.replace("from schemas.activity import UpdateInboxRequest, MarkAllReadRequest", poll_routes + "\nfrom schemas.activity import UpdateInboxRequest, MarkAllReadRequest")
    
    with open("backend/routes/activity.py", "w") as f:
        f.write(content)
