import time
import os
import traceback
import requests
from datetime import datetime, timezone
from stellar_sdk import SorobanServer
from stellar_sdk.xdr import SCVal

from databases.mongo_state import StateDatabase
from databases.mongo_activity import ActivityDatabase
from databases.mongo_nft import NFTDatabase
from utils.scval import scval_to_native

TOKEN_MAP = {
    "CAXMJUKELFC7THVUKVH4NA5RYUDLORCKSZ5HTOPOMEXRMZJLFHKZJCQZ": "RPK",
    "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC": "XLM"
}

def format_amount(amount_stroops: int) -> str:
    amount = amount_stroops / 10000000
    if amount == int(amount):
        return f"{int(amount):,}"
    else:
        formatted = f"{amount:,.7f}".rstrip('0')
        if formatted.endswith('.'):
            formatted = formatted[:-1]
        return formatted

class IndexerController:
    def __init__(self):
        RPC_URL = os.getenv("SOROBAN_RPC_URL", "https://soroban-testnet.stellar.org")
        self.server = SorobanServer(RPC_URL)
        self.swap_contract_id = os.getenv("SWAP_CONTRACT_ID", "CCINFSQEIMF2AT5J3KKYFZ6ZAI6DSG5OKJQCHQNKLE7W56LBLSFNAYNZ")
        self.gift_contract_id = os.getenv("NFT_GIFT_CONTRACT_ID", "CDRUJJ6LXZS445XOKRXVDBTV4J4YHP3INTJB2Z5YKEMF4G2SWHDCPAIA")
        self.marketplace_contract_id = os.getenv("MARKETPLACE_CONTRACT_ID", "CBQUQ4MBD2HFTTR2X6WG6CHTOMPIK72XEQIG4HKUUSMT7F2R3LL64C7R")

    def process_events(self, contract_id: str, start_ledger: int, latest_ledger: int) -> int:
        if start_ledger == 0:
            start_ledger = max(latest_ledger - 5000, 1)
        elif start_ledger > latest_ledger:
            return start_ledger

        try:
            RPC_URL = os.getenv("SOROBAN_RPC_URL", "https://soroban-testnet.stellar.org")
            payload = {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "getEvents",
                "params": {
                    "startLedger": start_ledger,
                    "filters": [{"type": "contract", "contractIds": [contract_id]}],
                    "limit": 100,
                    "pagination": {"limit": 100}
                }
            }
            res = requests.post(RPC_URL, json=payload).json()
            if "error" in res:
                raise Exception(str(res["error"]))
                
            events = res.get("result", {}).get("events", [])
            if not events:
                return latest_ledger + 1
                
            for event in events:
                if event.get("type") != 'contract':
                    continue
                try:
                    topic_xdr = event.get("topic", [])
                    val_obj = event.get("value")
                    value_xdr = val_obj.get("xdr") if isinstance(val_obj, dict) else val_obj
                    if not value_xdr:
                        continue
                        
                    topic_scval = [SCVal.from_xdr(t) for t in topic_xdr]
                    value_scval = SCVal.from_xdr(value_xdr)
                    event_type = scval_to_native(topic_scval[0])
                    tx_hash = event.get("txHash", "")
                    ledger_seq = event.get("ledger", 0)
                    if event_type == "swap":
                        caller = scval_to_native(topic_scval[1])
                        token_in_address = scval_to_native(topic_scval[2])
                        token_in_symbol = TOKEN_MAP.get(token_in_address, "Token")
                        token_out_symbol = "RPK" if token_in_symbol == "XLM" else "XLM"
                        if value_scval.vec and len(value_scval.vec.sc_vec) == 3:
                            amount_in = scval_to_native(value_scval.vec.sc_vec[0])
                            ActivityDatabase.upsert_activity({
                                "transaction_hash": tx_hash,
                                "wallet_address": caller,
                                "activity_type": "Swap token",
                                "from_address": caller,
                                "to_address": self.swap_contract_id,
                                "details": f"{token_in_symbol} to {token_out_symbol}",
                                "amount": f"{format_amount(amount_in)} {token_in_symbol}",
                                "status": "success",
                                "datetime": datetime.now(timezone.utc).isoformat(),
                                "ledger": ledger_seq
                            })
                            print(f"✅ Indexed Activity: Swap token ({token_in_symbol} to {token_out_symbol}) by {caller}")

                    elif event_type == "deposit":
                        caller = scval_to_native(topic_scval[1])
                        if value_scval.vec and len(value_scval.vec.sc_vec) == 2:
                            amount_a = scval_to_native(value_scval.vec.sc_vec[0])
                            ActivityDatabase.upsert_activity({
                                "transaction_hash": tx_hash,
                                "wallet_address": caller,
                                "activity_type": "Deposit Liquidity",
                                "from_address": caller,
                                "to_address": self.swap_contract_id,
                                "details": f"Added by {caller[:6]}...",
                                "amount": f"{format_amount(amount_a)} Token A",
                                "status": "success",
                                "datetime": datetime.now(timezone.utc).isoformat(),
                                "ledger": ledger_seq
                            })
                            print(f"✅ Indexed Activity: Deposit by {caller}")

                    elif event_type == "BndlSent":
                        sender_addr = scval_to_native(topic_scval[1])
                        recipient_addr = scval_to_native(topic_scval[2])
                        item_id = scval_to_native(topic_scval[3])
                        if value_scval.vec and len(value_scval.vec.sc_vec) == 4:
                            token_addr = scval_to_native(value_scval.vec.sc_vec[0])
                            token_amount = scval_to_native(value_scval.vec.sc_vec[1])
                            token_uri = scval_to_native(value_scval.vec.sc_vec[2])
                            user_message = scval_to_native(value_scval.vec.sc_vec[3])
                            token_symbol = TOKEN_MAP.get(token_addr, "Token")
                            formatted_amount = f"{format_amount(token_amount)} {token_symbol}"
                            ActivityDatabase.upsert_activity({
                                "transaction_hash": tx_hash,
                                "wallet_address": sender_addr,
                                "activity_type": "Sent token",
                                "from_address": sender_addr,
                                "to_address": recipient_addr,
                                "details": f"To {recipient_addr[:6]}...",
                                "amount": formatted_amount,
                                "status": "success",
                                "datetime": datetime.now(timezone.utc).isoformat(),
                                "ledger": ledger_seq
                            })
                            ActivityDatabase.upsert_activity({
                                "transaction_hash": tx_hash,
                                "wallet_address": recipient_addr,
                                "activity_type": "Received token",
                                "from_address": sender_addr,
                                "to_address": recipient_addr,
                                "details": f"From {sender_addr[:6]}...",
                                "amount": formatted_amount,
                                "status": "success",
                                "datetime": datetime.now(timezone.utc).isoformat(),
                                "ledger": ledger_seq
                            })
                            
                            NFTDatabase.upsert_nft({
                                "token_id": item_id,
                                "contract_id": contract_id,
                                "owner_address": recipient_addr,
                                "sender_address": sender_addr,
                                "token_uri": token_uri,
                                "message": user_message,
                                "token_used": token_addr,
                                "token_amount": formatted_amount,
                                "datetime": datetime.now(timezone.utc)
                            })
                            
                            print(f"✅ Indexed Activity: Gift from {sender_addr} to {recipient_addr}")

                    elif event_type == "Transfer":
                        from_addr = scval_to_native(topic_scval[1])
                        to_addr = scval_to_native(topic_scval[2])
                        token_id = scval_to_native(topic_scval[3])
                        default_uri = scval_to_native(value_scval) if value_scval else None
                        NFTDatabase.update_owner(token_id, to_addr, default_uri)
                        print(f"✅ Indexed NFT Transfer #{token_id} from {from_addr} to {to_addr}")

                    elif event_type == "Listed":
                        seller = scval_to_native(topic_scval[1])
                        token_id = scval_to_native(topic_scval[2])
                        if value_scval.vec and len(value_scval.vec.sc_vec) == 2:
                            payment_token = scval_to_native(value_scval.vec.sc_vec[0])
                            price = scval_to_native(value_scval.vec.sc_vec[1])
                            token_symbol = TOKEN_MAP.get(payment_token, "Token")
                            formatted_price = f"{format_amount(price)} {token_symbol}"
                            ActivityDatabase.upsert_activity({
                                "transaction_hash": tx_hash,
                                "wallet_address": seller,
                                "activity_type": "List NFT",
                                "from_address": seller,
                                "to_address": self.marketplace_contract_id,
                                "details": f"NFT #{token_id}",
                                "amount": formatted_price,
                                "status": "success",
                                "datetime": datetime.now(timezone.utc).isoformat(),
                                "ledger": ledger_seq
                            })
                            print(f"✅ Indexed Activity: Listed NFT #{token_id} by {seller}")

                    elif event_type == "Sold":
                        buyer = scval_to_native(topic_scval[1])
                        seller = scval_to_native(topic_scval[2])
                        token_id = scval_to_native(topic_scval[3])
                        if value_scval.vec and len(value_scval.vec.sc_vec) == 2:
                            payment_token = scval_to_native(value_scval.vec.sc_vec[0])
                            price = scval_to_native(value_scval.vec.sc_vec[1])
                            token_symbol = TOKEN_MAP.get(payment_token, "Token")
                            formatted_price = f"{format_amount(price)} {token_symbol}"
                            
                            ActivityDatabase.upsert_activity({
                                "transaction_hash": tx_hash,
                                "wallet_address": buyer,
                                "activity_type": "Buy NFT",
                                "from_address": buyer,
                                "to_address": seller,
                                "details": f"Bought NFT #{token_id}",
                                "amount": formatted_price,
                                "status": "success",
                                "datetime": datetime.now(timezone.utc).isoformat(),
                                "ledger": ledger_seq
                            })
                            
                            ActivityDatabase.upsert_activity({
                                "transaction_hash": tx_hash,
                                "wallet_address": seller,
                                "activity_type": "Sell NFT",
                                "from_address": buyer,
                                "to_address": seller,
                                "details": f"Sold NFT #{token_id}",
                                "amount": formatted_price,
                                "status": "success",
                                "datetime": datetime.now(timezone.utc).isoformat(),
                                "ledger": ledger_seq
                            })
                            print(f"✅ Indexed Activity: Sold NFT #{token_id} from {seller} to {buyer}")
                    
                    elif event_type == "Canceled":
                        seller = scval_to_native(topic_scval[1])
                        token_id = scval_to_native(topic_scval[2])
                        ActivityDatabase.upsert_activity({
                            "transaction_hash": tx_hash,
                            "wallet_address": seller,
                            "activity_type": "Cancel Listing",
                            "from_address": seller,
                            "to_address": self.marketplace_contract_id,
                            "details": f"NFT #{token_id}",
                            "amount": "-",
                            "status": "success",
                            "datetime": datetime.now(timezone.utc).isoformat(),
                            "ledger": ledger_seq
                        })
                        print(f"✅ Indexed Activity: Canceled NFT #{token_id} by {seller}")


                except Exception as e:
                    print(f"Error parsing event {tx_hash}: {e}")
                    traceback.print_exc()

            return latest_ledger + 1

        except Exception as e:
            err_msg = str(e)
            print(f"Error fetching events for {contract_id}: {err_msg}")
            if "startLedger must be within the ledger range" in err_msg or "too old" in err_msg.lower():
                print(f"Self-recovery: skipping to latest_ledger - 5000 for {contract_id}")
                return max(latest_ledger - 5000, 1)
            return start_ledger

    def run_loop(self):
        print("Starting Web3 Indexer Loop (Per-Contract State)...")
        while True:
            try:
                try:
                    latest_ledger_info = self.server.get_latest_ledger()
                    latest_ledger = latest_ledger_info.sequence
                except Exception as e:
                    print(f"Error fetching latest ledger: {e}")
                    time.sleep(5)
                    continue

                swap_last = StateDatabase.get_last_ledger(self.swap_contract_id)
                new_swap_last = self.process_events(self.swap_contract_id, swap_last, latest_ledger)
                if new_swap_last != swap_last:
                    StateDatabase.update_last_ledger(self.swap_contract_id, new_swap_last)
                gift_last = StateDatabase.get_last_ledger(self.gift_contract_id)
                new_gift_last = self.process_events(self.gift_contract_id, gift_last, latest_ledger)
                if new_gift_last != gift_last:
                    StateDatabase.update_last_ledger(self.gift_contract_id, new_gift_last)
                    
                marketplace_last = StateDatabase.get_last_ledger(self.marketplace_contract_id)
                new_marketplace_last = self.process_events(self.marketplace_contract_id, marketplace_last, latest_ledger)
                if new_marketplace_last != marketplace_last:
                    StateDatabase.update_last_ledger(self.marketplace_contract_id, new_marketplace_last)
            except Exception as e:
                print(f"Unhandled error in main loop: {e}")
                traceback.print_exc()
            time.sleep(5)
