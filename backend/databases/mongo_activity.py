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
    def get_activities(wallet_address: str, limit: int = 50, category: str = None):
        query = Q(wallet_address=wallet_address) | Q(to_address=wallet_address)
        
        if category and category != "All Notification":
            if category == "Transfer":
                query = query & Q(activity_type__in=["Sent token", "Received token"])
            elif category == "Swap":
                query = query & Q(activity_type="Swap token")
            elif category == "System":
                query = query & Q(activity_type="Deposit Liquidity")
            elif category == "Rewards":
                query = query & Q(activity_type__icontains="Reward")
            elif category == "Rooms":
                query = query & Q(activity_type__icontains="Room")
                
        activities = Activity.objects(query).order_by("-datetime").limit(limit)
        import json
        return [json.loads(act.to_json()) for act in activities]

    @staticmethod
    def mark_all_read(wallet_address: str, category: str = None):
        query = Q(wallet_address=wallet_address) | Q(to_address=wallet_address)
        
        if category and category != "All Notification":
            if category == "Transfer":
                query = query & Q(activity_type__in=["Sent token", "Received token"])
            elif category == "Swap":
                query = query & Q(activity_type="Swap token")
            elif category == "System":
                query = query & Q(activity_type="Deposit Liquidity")
            elif category == "Rewards":
                query = query & Q(activity_type__icontains="Reward")
            elif category == "Rooms":
                query = query & Q(activity_type__icontains="Room")
                
        # Only update those that are unread
        query = query & Q(is_atribut=False)
        
        # In mongoengine, we can do a bulk update
        updated_count = Activity.objects(query).update(is_atribut=True)
        return updated_count
