import os
import json
from dotenv import load_dotenv
from mongoengine import connect
from databases.mongo_activity import ActivityDatabase
from models.mongo_nft import NFT
from models.mongo_activity import Activity

load_dotenv("backend/.env")
connect(host=os.getenv("MONGO_URI"))

act = Activity.objects(activity_type="Sent token").order_by("-datetime").first()
print("ACTIVITY:")
print(act.to_json() if act else "None")

nft = NFT.objects().order_by("-datetime").first()
print("NFT:")
print(nft.to_json() if nft else "None")

