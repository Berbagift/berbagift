import sys
import os
sys.path.append(os.getcwd())
from configs.mongo_db import connect_db
from models.mongo_room import Room

connect_db()

rooms = Room.objects()
print(f"Total rooms: {len(rooms)}")
for r in rooms:
    print(f"RoomId={r.room_id} Title='{r.title}' Owner={r.owner}")
