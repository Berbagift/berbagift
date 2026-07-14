import sys
import os
sys.path.append(os.getcwd())
from databases.connection import get_db_session

db = next(get_db_session())
from models.room import Room
for r in db.query(Room).all():
    print(f"ID={r.id} RoomId={r.room_id} Title='{r.title}' Admin={r.admin}")
