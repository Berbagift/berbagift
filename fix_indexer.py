import re

with open("backend/controllers/indexer.py", "r") as f:
    content = f.read()

# 1. Add registry_contract_id to __init__
old_init = """        self.multi_room_contract_id = os.getenv("MULTI_ROOM_CONTRACT_ID", "CANYHO2JONDBIKBCL4GCQKI6EFKRSIUMSOI2NYVA725U35JZPE3LIQHE")"""
new_init = """        self.multi_room_contract_id = os.getenv("MULTI_ROOM_CONTRACT_ID", "CANYHO2JONDBIKBCL4GCQKI6EFKRSIUMSOI2NYVA725U35JZPE3LIQHE")
        self.registry_contract_id = os.getenv("TOKEN_REGISTRY_CONTRACT_ID", "")"""
content = content.replace(old_init, new_init)

# 2. Add event parsing logic
old_event = """                    elif event_type == "swap_b2t":"""
new_event = """                    elif event_type == "add_token":
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

# 3. Add to run_loop
old_loop = """                multi_room_last = StateDatabase.get_last_ledger(self.multi_room_contract_id)"""
new_loop = """                if self.registry_contract_id:
                    registry_last = StateDatabase.get_last_ledger(self.registry_contract_id)
                    new_registry_last = self.process_events(self.registry_contract_id, registry_last, latest_ledger)
                    if new_registry_last != registry_last:
                        StateDatabase.update_last_ledger(self.registry_contract_id, new_registry_last)

                multi_room_last = StateDatabase.get_last_ledger(self.multi_room_contract_id)"""
content = content.replace(old_loop, new_loop)

with open("backend/controllers/indexer.py", "w") as f:
    f.write(content)

