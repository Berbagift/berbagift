import requests
import json
from stellar_sdk.xdr import SCVal
import sys

sys.path.append(".")
from utils.scval import scval_to_native

RPC_URL = "https://soroban-testnet.stellar.org"
contract_id = "CDRUJJ6LXZS445XOKRXVDBTV4J4YHP3INTJB2Z5YKEMF4G2SWHDCPAIA"

# Get latest ledger
latest_res = requests.post(RPC_URL, json={"jsonrpc":"2.0","id":1,"method":"getLatestLedger"}).json()
latest_ledger = latest_res["result"]["sequence"]

payload = {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "getEvents",
    "params": {
        "startLedger": latest_ledger - 1000,
        "filters": [{"type": "contract", "contractIds": [contract_id]}],
        "limit": 100,
        "pagination": {"limit": 100}
    }
}

res = requests.post(RPC_URL, json=payload).json()
if "result" in res:
    events = res["result"].get("events", [])
    print("Found events:", len(events))
    for event in events:
        topic_xdr = event.get("topic", [])
        val_obj = event.get("value")
        value_xdr = val_obj.get("xdr") if isinstance(val_obj, dict) else val_obj
        if not value_xdr: continue
        topic_scval = [SCVal.from_xdr(t) for t in topic_xdr]
        value_scval = SCVal.from_xdr(value_xdr)
        
        event_type = scval_to_native(topic_scval[0])
        print("=== Event Type:", event_type, "===")
        
        for i, t in enumerate(topic_scval):
            try:
                print(f"Topic {i}:", scval_to_native(t))
            except Exception as e:
                print(f"Topic {i} parse error:", e)
                
        try:
            if value_scval.vec:
                print("Value is vec of len", len(value_scval.vec.sc_vec))
                for i, v in enumerate(value_scval.vec.sc_vec):
                    print(f"Value {i}:", scval_to_native(v))
        except Exception as e:
            print("Value parse error:", e)

elif "error" in res:
    print("Error:", res["error"])
