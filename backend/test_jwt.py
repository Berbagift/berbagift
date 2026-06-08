from datetime import timedelta
import os
import sys

# Add backend directory to sys path
sys.path.append(os.path.abspath('.'))

try:
    from utils.jwt import create_access_token
    token = create_access_token(data={"sub": "1", "wallet_address": "GDR5..."})
    print("TOKEN_SUCCESS:", token)
except Exception as e:
    print("TOKEN_ERROR:", str(e))
