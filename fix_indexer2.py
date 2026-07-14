import re

with open("backend/controllers/indexer.py", "r") as f:
    content = f.read()

old_event = """                    if event_type == "swap_b2t":"""
new_event = """                    if event_type == "add_token":
                        token_address = scval_to_native(topic_scval[1])
                        token_symbol = TOKEN_MAP.get(token_address, "Token")
                        ActivityDatabase.upsert_activity({
                            "transaction_hash": tx_hash,
                            "wallet_address": "System",
                            "activity_type": "Add Token",
                            "from_address": "Admin",
                            "to_address": self.registry_contract_id,
                            "details": f"Added {token_symbol} ({token_address[:6]}...)",
                            "amount": "-",
                            "status": "success",
                            "datetime": datetime.now(timezone.utc).isoformat(),
                            "ledger": ledger_seq
                        })
                        print(f"✅ Indexed Activity: Added Token {token_symbol} to Registry")

                    elif event_type == "rm_token":
                        token_address = scval_to_native(topic_scval[1])
                        token_symbol = TOKEN_MAP.get(token_address, "Token")
                        ActivityDatabase.upsert_activity({
                            "transaction_hash": tx_hash,
                            "wallet_address": "System",
                            "activity_type": "Remove Token",
                            "from_address": "Admin",
                            "to_address": self.registry_contract_id,
                            "details": f"Removed {token_symbol} ({token_address[:6]}...)",
                            "amount": "-",
                            "status": "success",
                            "datetime": datetime.now(timezone.utc).isoformat(),
                            "ledger": ledger_seq
                        })
                        print(f"✅ Indexed Activity: Removed Token {token_symbol} from Registry")
                        
                    elif event_type == "swap_b2t":"""

content = content.replace(old_event, new_event)

with open("backend/controllers/indexer.py", "w") as f:
    f.write(content)

