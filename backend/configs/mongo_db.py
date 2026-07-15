import os
from mongoengine import connect

def connect_db():
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/bagithr_indexer")
    connect(host=MONGO_URI)
