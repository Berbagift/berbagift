import os
import sys
from configs.mongo_db import connect_db
from databases.mongo_activity import ActivityDatabase

connect_db()
print(ActivityDatabase.get_activities("any_address", 10))
