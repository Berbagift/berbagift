from sqlalchemy.orm import Session
import jwt
from utils.jwt import verify_access_token
from databases.mongo_room import RoomDatabase
from databases.user import UserDatabase

class RoomController:
    def __init__(self, db: Session):
        self.db = db
        self.user_db = UserDatabase(db)

    def _attach_creator_info(self, room_data: dict) -> dict:
        owner_address = room_data.get("owner")
        if owner_address:
            user = self.user_db.get_user_by_wallet(owner_address)
            if user and user.username:
                username = user.username
                initials = username[:2].upper()
            else:
                username = f"{owner_address[:4]}...{owner_address[-4:]}"
                initials = "U"
            
            room_data["creator"] = {
                "username": username,
                "initials": initials,
                "role": "Room Creator"
            }
        return room_data

    def _attach_reward_idr(self, room_data: dict) -> dict:
        try:
            from controllers.token import TokenController
            token_controller = TokenController()
            prices, _ = token_controller.get_prices_waterfall()
            
            reward_str = room_data.get("reward", "0 XLM")
            parts = reward_str.split(" ")
            
            num_str = parts[0].replace(',', '')
            try:
                amount = float(num_str)
            except ValueError:
                amount = 0.0
                
            symbol = parts[1] if len(parts) > 1 else "XLM"
            
            if symbol == "XLM":
                rate = prices.get("XLM", 1600)
            elif symbol == "RPK":
                rate = prices.get("RPK", 1)
            else:
                rate = 1
                
            idr_value = int(round(amount * rate))
            room_data["rewardPoolIdr"] = f"Rp {idr_value:,}".replace(',', '.')
        except Exception as e:
            print(f"[!] Warning: Failed to calculate reward in IDR. Error: {e}")
            room_data["rewardPoolIdr"] = "Rp 0"
        return room_data

    def get_my_rooms(self, authorization: str | None, limit: int = 50):
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
            rooms = RoomDatabase.get_rooms_by_owner(wallet_address, limit)
            
            # Format _id and mapping if necessary
            formatted_rooms = []
            for room in rooms:
                id_str = str(room.get("_id", ""))
                if isinstance(room.get("_id"), dict):
                    id_str = str(room["_id"].get("$oid", ""))

                room_data = room.copy()
                room_data["id"] = room_data.get("transaction_hash") or id_str
                if "_id" in room_data:
                    del room_data["_id"]
                room_data = self._attach_creator_info(room_data)
                formatted_rooms.append(room_data)

            return {
                "message": "Successfully retrieved user rooms",
                "data": formatted_rooms,
                "errors": None
            }, 200
        except Exception as e:
            return {
                "message": "Internal server error",
                "data": None,
                "errors": {"Exception": str(e)}
            }, 500

    def explore_rooms(self, authorization: str | None, limit: int = 50):
        wallet_address = None
        if authorization and authorization.startswith("Bearer "):
            token = authorization.split(" ")[1]
            try:
                payload = verify_access_token(token)
                user_id = payload.get("sub")
                user = self.user_db.get_user_by_id(user_id)
                if user:
                    wallet_address = user.wallet_address
            except Exception:
                pass

        try:
            rooms = RoomDatabase.get_explore_rooms(wallet_address, limit)
            
            formatted_rooms = []
            for room in rooms:
                id_str = str(room.get("_id", ""))
                if isinstance(room.get("_id"), dict):
                    id_str = str(room["_id"].get("$oid", ""))

                room_data = room.copy()
                room_data["id"] = room_data.get("transaction_hash") or id_str
                if "_id" in room_data:
                    del room_data["_id"]
                room_data = self._attach_creator_info(room_data)
                formatted_rooms.append(room_data)

            return {
                "message": "Successfully retrieved explore rooms",
                "data": formatted_rooms,
                "errors": None
            }, 200
        except Exception as e:
            return {
                "message": "Internal server error",
                "data": None,
                "errors": {"Exception": str(e)}
            }, 500

    def get_room_by_id(self, identifier: str, authorization: str | None = None):
        wallet_address = None
        if authorization and authorization.startswith("Bearer "):
            token = authorization.split(" ")[1]
            try:
                payload = verify_access_token(token)
                user_id = payload.get("sub")
                user = self.user_db.get_user_by_id(user_id)
                if user:
                    wallet_address = user.wallet_address
            except Exception:
                pass

        try:
            room = RoomDatabase.get_room_by_id(identifier)
            if not room:
                return {
                    "message": "Room not found",
                    "data": None,
                    "errors": {"Not Found": "Room does not exist"}
                }, 404

            is_owner = (room.get("owner") == wallet_address)
            is_participant = False

            if wallet_address:
                is_participant = RoomDatabase.is_participant(room.get("room_id"), wallet_address)

            id_str = str(room.get("_id", ""))
            if isinstance(room.get("_id"), dict):
                id_str = str(room["_id"].get("$oid", ""))

            room_data = room.copy()
            room_data["id"] = id_str
            if "_id" in room_data:
                del room_data["_id"]
            room_data = self._attach_creator_info(room_data)
            room_data = self._attach_reward_idr(room_data)
            
            # Add is_joined attribute
            room_data["is_joined"] = is_owner or is_participant
            room_data["is_owner"] = is_owner

            return {
                "message": "Successfully retrieved room",
                "data": room_data,
                "errors": None
            }, 200
        except Exception as e:
            return {
                "message": "Internal server error",
                "data": None,
                "errors": {"Exception": str(e)}
            }, 500

    def get_room_participants(self, identifier: str):
        try:
            room = RoomDatabase.get_room_by_id(identifier)
            if not room:
                return {
                    "message": "Room not found",
                    "data": None,
                    "errors": {"Not Found": "Room does not exist"}
                }, 404
                
            room_id = room.get("room_id")
            participants_data = RoomDatabase.get_participants(room_id)
            
            result = []
            for p in participants_data:
                wallet = p.get("wallet_address")
                user = self.user_db.get_user_by_wallet(wallet)
                
                if user and user.username:
                    username = f"@{user.username}"
                    initials = user.username[:2].upper()
                else:
                    username = f"@{wallet[:4]}...{wallet[-4:]}"
                    initials = "U"
                    
                result.append({
                    "username": username,
                    "initials": initials,
                    "wallet_address": wallet,
                    "joined_at": p.get("created_at")
                })
                
            return {
                "message": "Successfully retrieved room participants",
                "data": result,
                "errors": None
            }, 200
        except Exception as e:
            return {
                "message": "Internal server error",
                "data": None,
                "errors": {"Exception": str(e)}
            }, 500

    def get_room_activities(self, identifier: str, limit: int = 100):
        try:
            room = RoomDatabase.get_room_by_id(identifier)
            if not room:
                return {
                    "message": "Room not found",
                    "data": None,
                    "errors": {"Not Found": "Room does not exist"}
                }, 404
                
            room_id = room.get("room_id")
            from databases.mongo_activity import ActivityDatabase
            
            activities = ActivityDatabase.get_room_activities(room_id, limit)
            
            # Format activities
            result = []
            username_cache = {}
            
            def get_uname(addr):
                if not addr: return "Unknown"
                if addr not in username_cache:
                    user = self.user_db.get_user_by_wallet(addr)
                    if user and user.username:
                        username_cache[addr] = f"@{user.username}"
                    else:
                        username_cache[addr] = f"@{addr[:4]}...{addr[-4:]}"
                return username_cache[addr]
                
            for act in activities:
                wallet = act.get("wallet_address", "")
                username = get_uname(wallet)
                act_type = act.get("activity_type", "")
                
                # Assign icons or formatted messages
                message = ""
                if act_type == "Joined Room":
                    message = f"{username} joined the room."
                elif act_type == "Left Room":
                    message = f"{username} left the room."
                elif act_type == "Claimed Reward":
                    message = f"{username} claimed their reward."
                elif act_type == "Completed Room":
                    message = f"The giveaway room has been completed and rewards drawn."
                    username = "Berbagift System"
                    wallet = "System"
                
                def extract_id(act):
                    raw = act.get("_id")
                    if isinstance(raw, dict):
                        return raw.get("$oid", str(raw))
                    return str(raw) if raw else ""
                    
                result.append({
                    "id": extract_id(act),
                    "username": username,
                    "wallet_address": wallet,
                    "activity_type": act_type,
                    "message": message,
                    "datetime": act.get("datetime")
                })
                
            return {
                "message": "Successfully retrieved room activities",
                "data": result,
                "errors": None
            }, 200
        except Exception as e:
            return {
                "message": "Internal server error",
                "data": None,
                "errors": {"Exception": str(e)}
            }, 500
