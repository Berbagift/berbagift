from mongoengine import Document, StringField, IntField, BooleanField

class Activity(Document):
    is_atribut = BooleanField(default=False)
    transaction_hash = StringField(required=True)
    wallet_address = StringField(required=True)
    activity_type = StringField(required=True)

    from_address = StringField(db_field="from", required=False, null=True, default=None)
    to_address = StringField(db_field="to", required=False, null=True, default=None)
    details = StringField(required=True)
    amount = StringField(required=True)
    status = StringField(required=True)

    datetime = StringField(required=True)

    ledger = IntField(required=True)

    meta = {'collection': 'activities'}
