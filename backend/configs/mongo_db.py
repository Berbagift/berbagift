import os
from mongoengine import connect

def connect_db():
    host = os.getenv("MONGO_HOST", "mongo")
    port = os.getenv("MONGO_PORT", "27017")
    user = os.getenv("MONGO_USER", "")
    password = os.getenv("MONGO_PASSWORD", "")
    db_name = os.getenv("MONGO_DB_NAME", "bagithr_indexer")

    if user and password:
        uri = f"mongodb://{user}:{password}@{host}:{port}/{db_name}?authSource=admin"
    else:
        uri = f"mongodb://{host}:{port}/{db_name}"

    print(f"[mongo_db] Connecting to MongoDB at {host}:{port}/{db_name}")
    connect(host=uri)
