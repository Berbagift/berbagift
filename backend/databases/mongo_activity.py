from models.mongo_activity import Activity
from mongoengine import Q

class ActivityDatabase:
    @staticmethod
    def upsert_activity(data: dict):
        tx_hash = data.get("transaction_hash")
        act_type = data.get("activity_type")
        wallet = data.get("wallet_address")
        details = data.get("details")
        activity = Activity.objects(transaction_hash=tx_hash, wallet_address=wallet, activity_type=act_type, details=details).first()
        if not activity:
            activity = Activity(**data)
        else:
            for k, v in data.items():
                setattr(activity, k, v)
        activity.save()
        return activity

    @staticmethod
    def get_activities(wallet_address: str, limit: int = 50):
        activities = Activity.objects(
            Q(wallet_address=wallet_address) |
            Q(to_address=wallet_address)
        ).order_by("-datetime").limit(limit)
        import json
        return [json.loads(act.to_json()) for act in activities]
