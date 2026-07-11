import os
from controllers.indexer import IndexerController
from configs.mongo_db import connect_db
connect_db()

indexer = IndexerController()
latest = indexer.server.get_latest_ledger().sequence
# Force start from a recent ledger where the gifts happened
start_ledger = max(latest - 100, 1)

print(f"Indexing gift contract from {start_ledger} to {latest}...")
new_last = indexer.process_events(indexer.gift_contract_id, start_ledger, latest)
print(f"Done. new_last = {new_last}")
