import json
from datetime import datetime
from mongoengine import Document, DateTimeField
import mongoengine

mongoengine.connect('test_db', host='mongomock://localhost', mongo_client_class=__import__('mongomock').MongoClient)

class TestDoc(Document):
    created_at = DateTimeField(default=datetime.utcnow)

doc = TestDoc().save()
print(doc.to_json())
