import sys
import os
sys.path.append(os.getcwd())
from configs.mongo_db import connect_db
from mongoengine.connection import get_db

connect_db()
db = get_db()
print(db.list_collection_names())
rooms_coll = db['rooms']
print("Rooms count:", rooms_coll.count_documents({}))
acts_coll = db['activities']
print("Activities count:", acts_coll.count_documents({"activity_type": "Created Room"}))
