from mongoengine import Document, StringField, IntField

class IndexerState(Document):
    state_id = StringField(primary_key=True)
    last_ledger_processed = IntField(default=0)
    meta = {'collection': 'indexer_state'}
