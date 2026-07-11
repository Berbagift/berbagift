from mongoengine import Document, StringField, IntField, DateTimeField

class NFT(Document):
    token_id = IntField(required=True, unique=True)
    contract_id = StringField(required=True)
    owner_address = StringField(required=True)
    sender_address = StringField(required=True)
    token_uri = StringField(required=True)
    message = StringField(default="")
    token_used = StringField(required=True)
    token_amount = StringField(required=True)
    datetime = DateTimeField(required=True)

    meta = {
        'collection': 'nfts',
        'indexes': [
            'owner_address',
            'token_id'
        ]
    }
