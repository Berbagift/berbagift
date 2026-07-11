from sqlalchemy.orm import Session
import jwt
from utils.jwt import verify_access_token
from databases.mongo_activity import ActivityDatabase
from databases.user import UserDatabase
from schemas.response import APIResponse

class ActivityController:
    def __init__(self, db: Session):
        self.db = db
        self.user_db = UserDatabase(db)

    def get_activities(self, authorization: str | None, limit: int = 50):
        if not authorization or not authorization.startswith("Bearer "):
            return {
                "message": "Authentication failed: Missing or invalid Authorization header",
                "data": None,
                "errors": {"Auth": "IS_INVALID"}
            }, 401

        token = authorization.split(" ")[1]
        try:
            payload = verify_access_token(token)
            user_id = payload.get("sub")
        except jwt.ExpiredSignatureError:
            return {
                "message": "Token has expired",
                "data": None,
                "errors": {"Auth": "IS_INVALID"}
            }, 401
        except jwt.InvalidTokenError:
            return {
                "message": "Invalid token",
                "data": None,
                "errors": {"Auth": "IS_INVALID"}
            }, 401

        user = self.user_db.get_user_by_id(user_id)
        if not user:
            return {
                "message": "Authentication failed: User not found",
                "data": None,
                "errors": {"Auth": "IS_INVALID"}
            }, 404

        wallet_address = user.wallet_address
        if not wallet_address:
            return {
                "message": "Wallet not found",
                "data": None,
                "errors": {"Auth": "IS_INVALID"}
            }, 400

        try:
            activities = ActivityDatabase.get_activities(wallet_address, limit)
            username_cache = {}
            for act in activities:
                other_address = None
                prefix = ""
                if act.get("activity_type") == "Sent token":
                    other_address = act.get("to") or act.get("to_address")
                    prefix = "To @"
                elif act.get("activity_type") == "Received token":
                    other_address = act.get("from") or act.get("from_address")
                    prefix = "From @"
                elif act.get("activity_type") == "Deposit Liquidity":
                    other_address = act.get("wallet_address")
                    prefix = "Added by @"
                if other_address:
                    if other_address not in username_cache:
                        other_user = self.user_db.get_user_by_wallet(other_address)
                        if other_user and other_user.username:
                            uname = other_user.username
                            if len(uname) < 56:
                                username_cache[other_address] = uname
                            else:
                                username_cache[other_address] = other_address[:6] + "..."
                        else:
                            username_cache[other_address] = other_address[:6] + "..."
                    display_name = username_cache[other_address]
                    act["details"] = f"{prefix}{display_name}"
            return {
                "message": "Successfully retrieved activities",
                "data": activities,
                "errors": None
            }, 200
        except Exception as e:
            return {
                "message": "Internal server error",
                "data": None,
                "errors": {"Exception": str(e)}
            }, 500

    def get_inbox(self, authorization: str | None, limit: int = 50, category: str | None = None):
        if not authorization or not authorization.startswith("Bearer "):
            return {
                "message": "Authentication failed",
                "data": None,
                "errors": {"Auth": "IS_INVALID"}
            }, 401

        token = authorization.split(" ")[1]
        try:
            payload = verify_access_token(token)
            user_id = payload.get("sub")
        except jwt.ExpiredSignatureError:
            return {"message": "Token expired", "data": None, "errors": None}, 401
        except jwt.InvalidTokenError:
            return {"message": "Invalid token", "data": None, "errors": None}, 401

        try:
            user = self.user_db.get_user_by_id(user_id)
            if not user:
                return {"message": "User not found", "data": None, "errors": None}, 404

            wallet_address = user.wallet_address
            from databases.mongo_activity import ActivityDatabase
            
            # Calculate counts
            all_activities = ActivityDatabase.get_activities(wallet_address, limit=1000)
            counts = {
                "All Notification": len(all_activities),
                "Rewards": 0,
                "Rooms": 0,
                "Transfer": 0,
                "Swap": 0,
                "System": 0
            }
            for act in all_activities:
                act_type = act.get("activity_type", "")
                if act_type in ["Sent token", "Received token"]:
                    counts["Transfer"] += 1
                elif act_type == "Swap token":
                    counts["Swap"] += 1
                elif "Reward" in act_type:
                    counts["Rewards"] += 1
                elif "Room" in act_type:
                    counts["Rooms"] += 1
                else:
                    counts["System"] += 1

            activities = ActivityDatabase.get_activities(wallet_address, limit, category)
            username_cache = {}
            inbox_items = []

            def get_uname(addr):
                if not addr: return "Unknown"
                if addr not in username_cache:
                    other_user = self.user_db.get_user_by_wallet(addr)
                    if other_user and other_user.username:
                        uname = other_user.username
                        if len(uname) < 56:
                            username_cache[addr] = "@" + uname
                        else:
                            username_cache[addr] = addr[:6] + "..."
                    else:
                        username_cache[addr] = addr[:6] + "..."
                return username_cache[addr]

            for act in activities:
                act_type = act.get("activity_type", "")
                amount_str = act.get("amount", "")
                
                title = ""
                description = ""
                sender_or_recipient = ""
                
                if act_type == "Sent token":
                    title = "Transfer success"
                    to_addr = act.get("to_address", "")
                    uname = get_uname(to_addr)
                    sender_or_recipient = uname
                    description = f"You successfully sent {amount_str} to {uname}. The transaction has been processed."
                elif act_type == "Received token":
                    title = "Transfer received"
                    from_addr = act.get("from_address", "")
                    uname = get_uname(from_addr)
                    sender_or_recipient = uname
                    description = f"You successfully received {amount_str} from {uname}. The transaction has been processed."
                elif act_type == "Swap token":
                    title = "Swap success"
                    sender_or_recipient = "Soroban DEX"
                    description = f"You successfully swapped your token. The transaction has been processed."
                elif act_type == "Deposit Liquidity":
                    title = "Deposit success"
                    sender_or_recipient = "Soroban Pool"
                    description = f"You successfully deposited liquidity. The transaction has been processed."
                else:
                    title = act_type
                    sender_or_recipient = act.get("to_address", "Unknown")[:6] + "..."
                    description = act.get("details", "")
                    
                id_str = str(act.get("_id", ""))
                if "$oid" in id_str:
                    id_str = act["_id"]["$oid"]
                elif isinstance(act.get("_id"), dict):
                    id_str = str(act["_id"].get("$oid", ""))
                    
                inbox_items.append({
                    "id": id_str,
                    "title": title,
                    "description": description,
                    "tx_hash": act.get("transaction_hash"),
                    "transaction_value": amount_str,
                    "datetime": act.get("datetime"),
                    "sender_or_recipient": sender_or_recipient,
                    "is_read": act.get("is_atribut", False)
                })

            return {
                "message": "Successfully retrieved inbox",
                "data": {
                    "items": inbox_items,
                    "counts": counts
                },
                "errors": None
            }, 200
        except Exception as e:
            return {
                "message": "Internal server error",
                "data": None,
                "errors": {"Exception": str(e)}
            }, 500

    def update_inbox_item(self, authorization: str | None, activity_id: str, updates: dict):
        if not authorization or not authorization.startswith("Bearer "):
            return {
                "message": "Authentication failed",
                "data": None,
                "errors": {"Auth": "IS_INVALID"}
            }, 401
            
        token = authorization.split(" ")[1]
        try:
            payload = verify_access_token(token)
            user_id = payload.get("sub")
        except jwt.ExpiredSignatureError:
            return {"message": "Token expired", "data": None, "errors": None}, 401
        except jwt.InvalidTokenError:
            return {"message": "Invalid token", "data": None, "errors": None}, 401
            
        try:
            from models.mongo_activity import Activity
            activity = Activity.objects(id=activity_id).first()
            if not activity:
                return {"message": "Activity not found", "data": None, "errors": None}, 404
                
            if "read" in updates:
                activity.is_atribut = updates["read"]
                activity.save()
                
            return {
                "message": "Successfully updated inbox item",
                "data": {"id": activity_id, "is_read": activity.is_atribut},
                "errors": None
            }, 201
        except Exception as e:
            return {
                "message": "Internal server error",
                "data": None,
                "errors": {"Exception": str(e)}
            }, 500

    def mark_all_read(self, authorization: str | None, category: str | None = None):
        if not authorization or not authorization.startswith("Bearer "):
            return {
                "message": "Authentication failed",
                "data": None,
                "errors": {"Auth": "IS_INVALID"}
            }, 401
            
        token = authorization.split(" ")[1]
        try:
            payload = verify_access_token(token)
            user_id = payload.get("sub")
        except jwt.ExpiredSignatureError:
            return {"message": "Token expired", "data": None, "errors": None}, 401
        except jwt.InvalidTokenError:
            return {"message": "Invalid token", "data": None, "errors": None}, 401
            
        try:
            user = self.user_db.get_user_by_id(user_id)
            if not user:
                return {"message": "User not found", "data": None, "errors": None}, 404

            wallet_address = user.wallet_address
            from databases.mongo_activity import ActivityDatabase
            
            updated_count = ActivityDatabase.mark_all_read(wallet_address, category)
            
            return {
                "message": "Successfully marked all as read",
                "data": {"updated_count": updated_count},
                "errors": None
            }, 201
        except Exception as e:
            return {
                "message": "Internal server error",
                "data": None,
                "errors": {"Exception": str(e)}
            }, 500
