import sys
sys.path.append(".")
from databases.mongo_state import StateDatabase

gift_id = "CDRUJJ6LXZS445XOKRXVDBTV4J4YHP3INTJB2Z5YKEMF4G2SWHDCPAIA"
print("Gift Last Ledger:", StateDatabase.get_last_ledger(gift_id))

# Also reset it back to latest_ledger - 500 so we can re-index!
StateDatabase.update_last_ledger(gift_id, 3429794)
print("Reset Gift Last Ledger to 3429794")
