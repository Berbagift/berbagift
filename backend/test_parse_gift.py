import os
import traceback
from stellar_sdk import SorobanServer
from stellar_sdk.soroban_rpc import EventFilter
from stellar_sdk.xdr import SCVal

def scval_to_native(sc_val: SCVal):
    if sc_val.type == sc_val.type.SCV_ADDRESS:
        if sc_val.address.account_id:
            from stellar_sdk.strkey import StrKey
            return StrKey.encode_ed25519_public_key(sc_val.address.account_id.account_id.ed25519.uint256)
        elif sc_val.address.contract_id:
            from stellar_sdk.strkey import StrKey
            return StrKey.encode_contract(sc_val.address.contract_id.contract_id.hash)
    elif sc_val.type == sc_val.type.SCV_SYMBOL:
        return sc_val.sym.sc_symbol.decode()
    elif sc_val.type == sc_val.type.SCV_I128:
        hi = sc_val.i128.hi.int64
        lo = sc_val.i128.lo.uint64
        return (hi << 64) | lo
    elif sc_val.type == sc_val.type.SCV_U32:
        return sc_val.u32.uint32
    elif sc_val.type == sc_val.type.SCV_I32:
        return sc_val.i32.int32
    return str(sc_val)

server = SorobanServer("https://soroban-testnet.stellar.org")
gift_contract_id = "CAV3XXXN26KWVVS5QHRUS3G4VM5YUOIGNYFUQIEK4HXR3BPKX6H2OQSA"

latest_ledger = server.get_latest_ledger().sequence
start_ledger = max(latest_ledger - 100, 1)

event_filter = EventFilter(type="contract", contract_ids=[gift_contract_id], topics=[])
response = server.get_events(start_ledger=start_ledger, filters=[event_filter], limit=100)

if response and response.events:
    for event in response.events:
        print("Event:", event.transaction_hash)
        topic_scval = [SCVal.from_xdr(t) for t in event.topic]
        value_scval = SCVal.from_xdr(event.value)
        event_type = scval_to_native(topic_scval[0])
        print("Type:", event_type)
        if event_type == "BndlSent":
            print("FOUND BndlSent")
            print("Sender:", scval_to_native(topic_scval[1]))
            print("Recipient:", scval_to_native(topic_scval[2]))
            print("Value is vec:", value_scval.vec is not None)
            if value_scval.vec:
                print("Vec len:", len(value_scval.vec.sc_vec))
                for v in value_scval.vec.sc_vec:
                    try:
                        print("Val:", scval_to_native(v))
                    except Exception as e:
                        print("Err decoding val:", e)
else:
    print("No events in last 100 ledgers")
