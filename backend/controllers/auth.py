import base64
import secrets
from datetime import datetime
from stellar_sdk import Keypair
from sqlalchemy.orm import Session
from schemas.auth import NonceRequest, SignInRequest
from databases.user import UserDatabase
from databases.nonce import NonceDatabase

class AuthController:
    def __init__(self, db: Session):
        self.user_db = UserDatabase(db)
        self.nonce_db = NonceDatabase(db)

    def generate_nonce(self, request: NonceRequest):
        # Generate a random 16-byte hex string
        random_nonce = secrets.token_hex(16)
        # Format the message to be human-readable for the wallet signing prompt
        message = f"Welcome to BagiTHR!\n\nPlease sign this message to authenticate.\nNonce: {random_nonce}"
        
        # Upsert nonce in DB
        self.nonce_db.upsert_nonce(wallet_address=request.wallet_address, nonce_message=message)
        
        return {
            "message": "Nonce generated successfully",
            "data": {
                "nonce": message
            },
            "errors": None
        }, 201

    def sign_in(self, request: SignInRequest):
        # 1. Fetch Nonce
        stored_nonce = self.nonce_db.get_nonce(request.wallet_address)
        if not stored_nonce:
            return {
                "message": "Authentication failed",
                "data": None,
                "errors": {
                    "wallet_address": "IS_INVALID"
                }
            }, 400
            
        if datetime.utcnow() > stored_nonce.expires_at:
            self.nonce_db.delete_nonce(request.wallet_address)
            return {
                "message": "Authentication failed",
                "data": None,
                "errors": {
                    "wallet_address": "IS_INVALID"
                }
            }, 400

        # 2. Verify Stellar Signature against the stored nonce message
        try:
            kp = Keypair.from_public_key(request.wallet_address)
            
            try:
                signature_bytes = base64.b64decode(request.signature)
            except Exception:
                signature_bytes = bytes.fromhex(request.signature)
            
            # Freighter's signMessage automatically prefixes the message
            SIGN_MESSAGE_PREFIX = "Stellar Signed Message:\n"
            data_to_verify = (SIGN_MESSAGE_PREFIX + stored_nonce.nonce_message).encode('utf-8')
            
            # Freighter signs the SHA-256 hash of the prefixed message
            import hashlib
            data_hash = hashlib.sha256(data_to_verify).digest()
            
            try:
                # Some versions might sign the raw data, but usually it's the hash
                kp.verify(data_hash, signature_bytes)
            except Exception:
                # Fallback to verify raw data just in case
                kp.verify(data_to_verify, signature_bytes)
            
        except Exception as e:
            return {
                "message": "Signature verification failed",
                "data": None,
                "errors": {
                    "signature": "IS_INVALID"
                }
            }, 400

        # 3. Clean up used nonce (Prevent replay attack)
        self.nonce_db.delete_nonce(request.wallet_address)

        # 4. Check if user exists, else create
        user = self.user_db.get_user_by_wallet(request.wallet_address)
        
        if not user:
            user = self.user_db.create_user(
                wallet_address=request.wallet_address,
                username=request.wallet_address,
                email=request.wallet_address
            )
            status_code = 201
            message = "User registered and logged in successfully"
        else:
            status_code = 201
            message = "Login successful"
            
        return {
            "message": message,
            "data": {
                "user_id": user.id,
                "username": user.username,
                "wallet_address": user.wallet_address
            },
            "errors": None
        }, status_code
