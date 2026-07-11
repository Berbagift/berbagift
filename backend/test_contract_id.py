from stellar_sdk.xdr import Hash
from stellar_sdk.strkey import StrKey

contract_id_hash = Hash(b'1' * 32)
try:
    print(StrKey.encode_contract(contract_id_hash))
except Exception as e:
    print("Err1:", e)

try:
    print(StrKey.encode_contract(contract_id_hash.hash))
except Exception as e:
    print("Err2:", e)
