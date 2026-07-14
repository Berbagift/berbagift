from sqlalchemy.orm import Session
import jwt
from utils.jwt import verify_access_token
from databases.mongo_activity import ActivityDatabase
from databases.user import UserDatabase

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
                                username_cache[other_address] = f"{other_address[:4]}...{other_address[-4:]}"
                        else:
                            username_cache[other_address] = f"{other_address[:4]}...{other_address[-4:]}"
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

            # Include all public activities (Created Room, Add Token, Completed Room)
            all_public = ActivityDatabase.get_all_public_activities(limit=1000)
            existing_tx_ids = {a.get("transaction_hash") for a in all_activities}
            extra_rooms = 0
            extra_tokens = 0
            for pub_act in all_public:
                if pub_act.get("transaction_hash") not in existing_tx_ids:
                    act_type = pub_act.get("activity_type")
                    if act_type in ("Created Room", "Completed Room"):
                        extra_rooms += 1
                    elif act_type == "Add Token":
                        extra_tokens += 1
            counts["Rooms"] += extra_rooms
            counts["System"] += extra_tokens
            counts["All Notification"] += extra_rooms + extra_tokens

            activities = ActivityDatabase.get_activities(wallet_address, limit, category)
            
            if category in ("Rooms", "System", "All Notification", None):
                public_activities = ActivityDatabase.get_all_public_activities(limit)
                
                def extract_id(act):
                    raw = act.get("_id")
                    if isinstance(raw, dict):
                        return raw.get("$oid", str(raw))
                    return str(raw) if raw else ""
                
                existing_ids = {extract_id(a) for a in activities}
                for act in public_activities:
                    act_id = extract_id(act)
                    act_type = act.get("activity_type", "")
                    # Filter by category
                    if category == "Rooms" and act_type not in ["Created Room", "Completed Room"]:
                        continue
                    if category == "System" and act_type not in ["Add Token"]:
                        continue
                    if act_id and act_id not in existing_ids:
                        activities.append(act)
                        existing_ids.add(act_id)
                activities.sort(key=lambda a: a.get("datetime", ""), reverse=True)

            username_cache = {}
            inbox_items = []

            all_activity_ids = []
            def extract_id_local(act):
                raw = act.get("_id")
                if isinstance(raw, dict):
                    return raw.get("$oid", str(raw))
                return str(raw) if raw else ""

            for act in activities:
                aid = extract_id_local(act)
                if aid:
                    all_activity_ids.append(aid)

            read_ids = ActivityDatabase.get_read_ids(wallet_address)

            def get_uname(addr):
                if not addr: return "Unknown"
                if addr not in username_cache:
                    other_user = self.user_db.get_user_by_wallet(addr)
                    if other_user and other_user.username:
                        uname = other_user.username
                        if len(uname) < 56:
                            username_cache[addr] = "@" + uname
                        else:
                            username_cache[addr] = f"{addr[:4]}...{addr[-4:]}"
                    else:
                        username_cache[addr] = f"{addr[:4]}...{addr[-4:]}"
                return username_cache[addr]

            for act in activities:
                act_type = act.get("activity_type", "")
                amount_str = act.get("amount", "")
                
                title = ""
                description = ""
                sender_or_recipient = ""
                
                if act_type == "Sent token":
                    title = "Transfer success"
                    to_addr = act.get("to") or act.get("to_address", "")
                    uname = get_uname(to_addr)
                    sender_or_recipient = uname
                    description = f"You successfully sent {amount_str} to {uname}. The transaction has been processed."
                elif act_type == "Received token":
                    title = "Transfer received"
                    from_addr = act.get("from") or act.get("from_address", "")
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
                    if act.get("wallet_address") == wallet_address:
                        description = f"You successfully deposited {amount_str} into the liquidity pool. The transaction has been processed."
                    else:
                        who = get_uname(act.get("wallet_address"))
                        description = f"{who} deposited {amount_str} into the liquidity pool."
                elif act_type == "Created Room":
                    title = "New Room Created"
                    room_name = act.get("details", "")
                    creator_wallet = act.get("wallet_address", "")
                    if creator_wallet == wallet_address:
                        sender_or_recipient = "You"
                        description = f"You successfully created {room_name} with a reward pool of {amount_str}. The room is now live and participants can join."
                    else:
                        creator_uname = get_uname(creator_wallet)
                        sender_or_recipient = creator_uname
                        description = f"{creator_uname} created a new giveaway room {room_name} with a reward pool of {amount_str}. Join now!"

                elif act_type == "Completed Room":
                    title = "Room Giveaway Completed"
                    sender_or_recipient = "Berbagift System"
                    room_name = act.get("details", "")
                    description = f"The {room_name}. All winners have been selected and rewards are available to claim."

                elif act_type == "Add Token":
                    title = "New Token Listed"
                    sender_or_recipient = "Berbagift System"
                    token_info = act.get("details", "")
                    description = f"A new token has been listed on Berbagift: {token_info}. You can now use it for giveaways and swaps."

                elif act_type == "Joined Room":
                    title = "Joined Room"
                    sender_or_recipient = "Berbagift System"
                    room_name = act.get("details", "")
                    description = f"You successfully {room_name}."
                else:
                    title = act_type
                    sender_or_recipient = f"{act.get('to_address', 'Unknown')[:4]}...{act.get('to_address', 'Unknown')[-4:]}"
                    description = act.get("details", "")
                    
                id_str = extract_id_local(act)
                msg = ""
                raw_details = act.get("details", "")
                
                if act_type in ["Sent token", "Received token"]:
                    tx_hash = act.get("transaction_hash")
                    
                    try:
                        from models.mongo_nft import NFT
                        if tx_hash:
                            nft = NFT.objects(transaction_hash=tx_hash).first()
                            if nft and nft.message and nft.message != "Selamat Hari Raya! 🎁":
                                msg = nft.message
                                if not sender_or_recipient.startswith("@"):
                                    sender_or_recipient = msg
                                    msg = ""
                    except Exception as e:
                        print("Error fetching NFT message for activity by tx_hash:", e)
                
                if not msg and not (raw_details.startswith("From ") or raw_details.startswith("To ") or raw_details == "Selamat Hari Raya! 🎁"):
                    msg = raw_details

                room_id = act.get("room_id", None)
                # For "Created Room" activities that predate room_id storage:
                # look up the Room document by tx_hash to get the actual integer room_id.
                if room_id is None and act_type == "Created Room":
                    tx = act.get("transaction_hash")
                    if tx:
                        from databases.mongo_room import RoomDatabase
                        room_doc = RoomDatabase.get_room_by_id(tx)
                        if room_doc:
                            room_id = room_doc.get("room_id")

                inbox_items.append({
                    "id": id_str,
                    "title": title,
                    "description": description,
                    "tx_hash": act.get("transaction_hash"),
                    "transaction_value": amount_str,
                    "datetime": act.get("datetime"),
                    "sender_or_recipient": sender_or_recipient,
                    "is_read": id_str in read_ids,
                    "message": msg,
                    "room_name": act.get("details", "") if "Room" in act_type else "",
                    "room_id": room_id

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
            user = self.user_db.get_user_by_id(user_id)
            if not user:
                return {"message": "User not found", "data": None, "errors": None}, 404
            wallet_address = user.wallet_address

            from models.mongo_activity import Activity
            activity = Activity.objects(id=activity_id).first()
            if not activity:
                return {"message": "Activity not found", "data": None, "errors": None}, 404

            is_read = updates.get("read", False)
            if is_read:
                ActivityDatabase.mark_read(activity_id, wallet_address)

            return {
                "message": "Successfully updated inbox item",
                "data": {"id": activity_id, "is_read": is_read},
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

            # Also mark public activities (Created Room, Add Token, Completed Room) as read when applicable
            if category in ("Rooms", "System", "All Notification", None):
                def _eid(act):
                    raw = act.get("_id")
                    if isinstance(raw, dict):
                        return raw.get("$oid", str(raw))
                    return str(raw) if raw else ""

                public_acts = ActivityDatabase.get_all_public_activities(limit=1000)
                # Filter by category
                if category == "Rooms":
                    public_acts = [a for a in public_acts if a.get("activity_type") in ("Created Room", "Completed Room")]
                elif category == "System":
                    public_acts = [a for a in public_acts if a.get("activity_type") == "Add Token"]

                public_ids = [_eid(a) for a in public_acts]
                ActivityDatabase.mark_all_read_for_wallet(wallet_address, public_ids)

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
