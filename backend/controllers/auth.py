import base64
import secrets
from datetime import datetime
from stellar_sdk import Keypair
from sqlalchemy.orm import Session
from schemas.auth import NonceRequest, SignInRequest, UpdateProfileRequest
from databases.user import UserDatabase
from databases.nonce import NonceDatabase
from utils.jwt import create_access_token, verify_access_token
import jwt

class AuthController:
    def __init__(self, db: Session):
        self.user_db = UserDatabase(db)
        self.nonce_db = NonceDatabase(db)

    def _fetch_stellar_balances(self, wallet_address: str):
        try:
            from stellar_sdk import Server
            from stellar_sdk.exceptions import NotFoundError
            
            server = Server("https://horizon-testnet.stellar.org")
            
            try:
                account = server.accounts().account_id(wallet_address).call()
            except NotFoundError:
                # Wallet exists but is unfunded on Stellar Testnet
                return {"XLM": 0.0, "USDC": 0.0}
                
            balances = account.get("balances", [])
            xlm_balance = 0.0
            usdc_balance = 0.0
            
            for b in balances:
                if b.get("asset_type") == "native":
                    xlm_balance = float(b.get("balance", 0.0))
                elif b.get("asset_code") == "USDC":
                    usdc_balance = float(b.get("balance", 0.0))
                    
            return {"XLM": xlm_balance, "USDC": usdc_balance}
        except Exception as e:
            pass # Suppress network errors silently
            return {"XLM": 0.0, "USDC": 0.0}


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
                username=request.wallet_address
            )
            status_code = 201
            message = "User registered and logged in successfully"
        else:
            status_code = 201
            message = "Login successful"
            
        # Generate JWT access token
        access_token = create_access_token(
            data={"sub": str(user.id), "wallet_address": user.wallet_address}
        )
            
        return {
            "message": message,
            "data": {
                "user_id": user.id,
                "username": user.username,
                "wallet_address": user.wallet_address,
                "role": user.role,
                "access_token": access_token
            },
            "errors": None
        }, status_code

    def get_me(self, authorization: str | None):
        if not authorization or not authorization.startswith("Bearer "):
            return {
                "message": "Authentication failed: Missing or invalid Authorization header",
                "data": None,
                "errors": None
            }, 401
            
        token = authorization.split(" ")[1]
        try:
            payload = verify_access_token(token)
        except jwt.ExpiredSignatureError:
            return {
                "message": "Token has expired",
                "data": None,
                "errors": None
            }, 401
        except jwt.InvalidTokenError:
            return {
                "message": "Invalid token",
                "data": None,
                "errors": None
            }, 401
            
        user_id = payload.get("sub")
        if not user_id:
            return {
                "message": "Invalid token payload",
                "data": None,
                "errors": None
            }, 401
            
        user = self.user_db.get_user_by_id(int(user_id))
        if not user:
            return {
                "message": "User not found",
                "data": None,
                "errors": None
            }, 404
            
        # Fetch on-chain balances dynamically
        balances = self._fetch_stellar_balances(user.wallet_address)
            
        return {
            "message": "Successfully retrieved user data",
            "data": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "wallet_address": user.wallet_address,
                "role": user.role,
                "balances": balances
            },
            "errors": None
        }, 200

    def update_me(self, authorization: str | None, request: UpdateProfileRequest):
        # 1. Authenticate user via JWT
        if not authorization or not authorization.startswith("Bearer "):
            return {
                "message": "Authentication failed: Missing or invalid Authorization header",
                "data": None,
                "errors": None
            }, 401
            
        token = authorization.split(" ")[1]
        try:
            payload = verify_access_token(token)
        except jwt.ExpiredSignatureError:
            return {
                "message": "Token has expired",
                "data": None,
                "errors": None
            }, 401
        except jwt.InvalidTokenError:
            return {
                "message": "Invalid token",
                "data": None,
                "errors": None
            }, 401
            
        user_id_str = payload.get("sub")
        if not user_id_str:
            return {
                "message": "Invalid token payload",
                "data": None,
                "errors": None
            }, 401
            
        user_id = int(user_id_str)
        user = self.user_db.get_user_by_id(user_id)
        if not user:
            return {
                "message": "User not found",
                "data": None,
                "errors": None
            }, 404

        # 2. Extract fields
        new_username = request.username
        new_email = request.email

        # 3. Validate inputs & handle conflicts
        errors = {}

        if new_username is not None:
            if len(new_username) > 50:
                errors["username"] = "TOO_LONG"

        if new_email is not None:
            if len(new_email) > 100:
                errors["email"] = "TOO_LONG"
            elif self.user_db.check_email_exists(new_email, user_id):
                return {
                    "message": "Email already taken",
                    "data": None,
                    "errors": None
                }, 409

        if errors:
            return {
                "message": "Validation failed",
                "data": None,
                "errors": errors
            }, 400

        # 4. Update the DB
        updated_user = self.user_db.update_user(
            user=user,
            username=new_username,
            email=new_email
        )

        # 5. Return success per rules (201 for PUT success)
        return {
            "message": "Profile updated successfully",
            "data": {
                "id": updated_user.id,
                "username": updated_user.username,
                "email": updated_user.email,
                "wallet_address": updated_user.wallet_address,
                "role": updated_user.role
            },
            "errors": None
        }, 201
