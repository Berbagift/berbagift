import os
from mongoengine import connect

def connect_db():
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    DB_NAME = os.getenv("MONGO_DB_NAME", "bagithr_indexer")
    connect(host=MONGO_URI, db=DB_NAME)
