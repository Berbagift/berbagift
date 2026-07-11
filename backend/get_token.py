from utils.jwt import create_access_token
from databases.connection import get_db_session
from databases.user import UserDatabase

db = next(get_db_session())
user = UserDatabase(db).get_user_by_username("adit")
if not user:
    # Just take the first user
    from models.user import User
    user = db.query(User).first()

if user:
    token = create_access_token({"sub": str(user.id), "wallet_address": user.wallet_address})
    print(token)
else:
    print("NO USER")
