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
