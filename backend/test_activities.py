import sys
import os
sys.path.append(os.getcwd())
from configs.mongo_db import connect_db
from databases.mongo_activity import ActivityDatabase
from models.mongo_activity import Activity

connect_db()

acts = ActivityDatabase.get_activities(wallet_address="GDJ4JOYXVHVS6VPL6YAIKWABCLB2NJVQBKBRHCWSQQTVWBHTPZ3BLQFX", limit=100)
for a in acts:
    print(a.get('activity_type'), a.get('details'), a.get('transaction_hash'))
