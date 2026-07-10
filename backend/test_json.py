from models.mongo_activity import Activity
act = Activity(transaction_hash="1", wallet_address="2", activity_type="3", details="4", amount="5", status="6", datetime="7", ledger=8, from_address="a", to_address="b")
import json
print(json.loads(act.to_json()))
