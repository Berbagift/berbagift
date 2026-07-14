"""
Fix script: Patch existing 'Created Room' activities that have room_id=None.
Parses room_id from the `details` field (format: "Room '{title}' (#{room_id})").

Run from the backend/ directory:
    python fix_created_room_ids.py
"""
import re
import os
import sys

# Ensure we can import from the backend package
sys.path.insert(0, os.path.dirname(__file__))

from databases.connection import init_db
from databases.mongo_activity import ActivityDatabase
from models.mongo_activity import Activity

init_db()

activities = Activity.objects(activity_type="Created Room", room_id=None)
print(f"Found {activities.count()} 'Created Room' activities without room_id")

fixed = 0
failed = 0

for act in activities:
    details = act.details or ""
    # Format: "Room '{title}' (#123)"
    match = re.search(r'\(#(\d+)\)', details)
    if match:
        room_id = int(match.group(1))
        act.room_id = room_id
        act.save()
        print(f"  ✅ Fixed activity {act.id}: room_id={room_id} (details: {details!r})")
        fixed += 1
    else:
        print(f"  ⚠️  Could not parse room_id from details: {details!r}")
        failed += 1

print(f"\nDone. Fixed: {fixed}, Failed to parse: {failed}")
