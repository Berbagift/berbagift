from stellar_sdk.xdr import SCAddress, Hash
addr = SCAddress(contract_id=Hash(b'1'*32))
print(dir(addr.contract_id))
print(type(addr.contract_id))
print(addr.contract_id.hash)
