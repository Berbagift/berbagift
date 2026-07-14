import sys
import os
sys.path.append(os.getcwd())

# Import connection logic
from databases.mongo_activity import ActivityDatabase
from models.mongo_activity import Activity
from models.mongo_base import init_mongo

init_mongo()

print("Activities in DB:")
acts = Activity.objects(activity_type="Created Room")
for act in acts:
    print(act.to_dict())

