from stellar_sdk import SorobanServer
from stellar_sdk.soroban_rpc import EventFilter

server = SorobanServer("https://soroban-testnet.stellar.org")
try:
    event_filter = EventFilter(type="contract", contract_ids=["CCINFSQEIMF2AT5J3KKYFZ6ZAI6DSG5OKJQCHQNKLE7W56LBLSFNAYNZ"])
    server.get_events(start_ledger=1000, filters=[event_filter], limit=100)
except Exception as e:
    print(repr(e))
