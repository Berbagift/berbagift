from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from datetime import timedelta
from models.base import Base

class Nonce(Base):
    __tablename__ = "nonces"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    wallet_address = Column(String(56), unique=True, nullable=False, index=True)
    nonce_message = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    # Note: For SQLite/MySQL we can enforce expiration logically in the application layer
    expires_at = Column(DateTime(timezone=True), nullable=False)
