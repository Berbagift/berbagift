import time
import os
import traceback
from datetime import datetime, timezone
from stellar_sdk import SorobanServer
from stellar_sdk.soroban_rpc import EventFilter
from stellar_sdk.xdr import SCVal

from databases.mongo_state import StateDatabase
from databases.mongo_activity import ActivityDatabase
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
        self.gift_contract_id = os.getenv("NFT_GIFT_CONTRACT_ID", "CAV3XXXN26KWVVS5QHRUS3G4VM5YUOIGNYFUQIEK4HXR3BPKX6H2OQSA")

    def process_events(self, contract_id: str, start_ledger: int, latest_ledger: int) -> int:
        if start_ledger == 0:
            start_ledger = max(latest_ledger - 5000, 1)
        elif start_ledger > latest_ledger:
            return start_ledger

        try:
            event_filter = EventFilter(
                type="contract",
                contract_ids=[contract_id],
                topics=[]
            )
            response = self.server.get_events(
                start_ledger=start_ledger,
                filters=[event_filter],
                limit=100
            )
            if not response or not response.events:
                return latest_ledger + 1
            for event in response.events:
                if event.event_type != 'contract':
                    continue
                try:
                    topic_scval = [SCVal.from_xdr(t) for t in event.topic]
                    value_scval = SCVal.from_xdr(event.value)
                    event_type = scval_to_native(topic_scval[0])
                    if event_type == "swap":
                        caller = scval_to_native(topic_scval[1])
                        token_in_address = scval_to_native(topic_scval[2])
                        token_in_symbol = TOKEN_MAP.get(token_in_address, "Token")
                        token_out_symbol = "RPK" if token_in_symbol == "XLM" else "XLM"
                        if value_scval.vec and len(value_scval.vec.sc_vec) == 3:
                            amount_in = scval_to_native(value_scval.vec.sc_vec[0])
                            ActivityDatabase.upsert_activity({
                                "transaction_hash": event.transaction_hash,
                                "wallet_address": caller,
                                "activity_type": "Swap token",
                                "from_address": caller,
                                "to_address": self.swap_contract_id,
                                "details": f"{token_in_symbol} to {token_out_symbol}",
                                "amount": f"{format_amount(amount_in)} {token_in_symbol}",
                                "status": "success",
                                "datetime": datetime.now(timezone.utc).isoformat(),
                                "ledger": event.ledger
                            })
                            print(f"✅ Indexed Activity: Swap token ({token_in_symbol} to {token_out_symbol}) by {caller}")

                    elif event_type == "deposit":
                        caller = scval_to_native(topic_scval[1])
                        if value_scval.vec and len(value_scval.vec.sc_vec) == 2:
                            amount_a = scval_to_native(value_scval.vec.sc_vec[0])
                            ActivityDatabase.upsert_activity({
                                "transaction_hash": event.transaction_hash,
                                "wallet_address": caller,
                                "activity_type": "Deposit Liquidity",
                                "from_address": caller,
                                "to_address": self.swap_contract_id,
                                "details": f"Added by {caller[:6]}...",
                                "amount": f"{format_amount(amount_a)} Token A",
                                "status": "success",
                                "datetime": datetime.now(timezone.utc).isoformat(),
                                "ledger": event.ledger
                            })
                            print(f"✅ Indexed Activity: Deposit by {caller}")

                    elif event_type == "BndlSent":
                        sender_addr = scval_to_native(topic_scval[1])
                        recipient_addr = scval_to_native(topic_scval[2])
                        item_id = scval_to_native(topic_scval[3])
                        if value_scval.vec and len(value_scval.vec.sc_vec) == 4:
                            token_addr = scval_to_native(value_scval.vec.sc_vec[0])
                            token_amount = scval_to_native(value_scval.vec.sc_vec[1])
                            token_symbol = TOKEN_MAP.get(token_addr, "Token")
                            formatted_amount = f"{format_amount(token_amount)} {token_symbol}"
                            ActivityDatabase.upsert_activity({
                                "transaction_hash": event.transaction_hash,
                                "wallet_address": sender_addr,
                                "activity_type": "Sent token",
                                "from_address": sender_addr,
                                "to_address": recipient_addr,
                                "details": f"To {recipient_addr[:6]}...",
                                "amount": formatted_amount,
                                "status": "success",
                                "datetime": datetime.now(timezone.utc).isoformat(),
                                "ledger": event.ledger
                            })
                            ActivityDatabase.upsert_activity({
                                "transaction_hash": event.transaction_hash,
                                "wallet_address": recipient_addr,
                                "activity_type": "Received token",
                                "from_address": sender_addr,
                                "to_address": recipient_addr,
                                "details": f"From {sender_addr[:6]}...",
                                "amount": formatted_amount,
                                "status": "success",
                                "datetime": datetime.now(timezone.utc).isoformat(),
                                "ledger": event.ledger
                            })
                            print(f"✅ Indexed Activity: Gift from {sender_addr} to {recipient_addr}")


                except Exception as e:
                    print(f"Error parsing event {event.transaction_hash}: {e}")
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
            except Exception as e:
                print(f"Unhandled error in main loop: {e}")
                traceback.print_exc()
            time.sleep(5)
