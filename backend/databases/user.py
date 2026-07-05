from sqlalchemy.orm import Session
from models.user import User

class UserDatabase:
    def __init__(self, db: Session):
        self.db = db

    def get_user_by_wallet(self, wallet_address: str):
        return self.db.query(User).filter(
            User.wallet_address == wallet_address,
            User.deleted_at.is_(None)
        ).first()

    def get_user_by_id(self, user_id: int):
        return self.db.query(User).filter(
            User.id == user_id,
            User.deleted_at.is_(None)
        ).first()

    def create_user(self, wallet_address: str, username: str, email: str | None = None):
        # Username maximum is 50 chars as per User model and rules
        new_user = User(
            wallet_address=wallet_address,
            username=username[:50],
            email=email[:100] if email else None
        )
        self.db.add(new_user)
        self.db.commit()
        self.db.refresh(new_user)
        return new_user

    def check_email_exists(self, email: str, exclude_user_id: int) -> bool:
        return self.db.query(User).filter(
            User.email == email,
            User.id != exclude_user_id,
            User.deleted_at.is_(None)
        ).first() is not None

    def update_user(self, user: User, username: str | None = None, email: str | None = None) -> User:
        if username is not None:
            user.username = username
        if email is not None:
            user.email = email
            
        self.db.commit()
        self.db.refresh(user)
        return user
