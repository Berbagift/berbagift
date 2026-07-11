from stellar_sdk import SorobanServer
from stellar_sdk.soroban_rpc import EventFilter
server = SorobanServer("https://soroban-testnet.stellar.org")
filters = [EventFilter(type="contract", contract_ids=["CDRUJJ6LXZS445XOKRXVDBTV4J4YHP3INTJB2Z5YKEMF4G2SWHDCPAIA"])]
latest = server.get_latest_ledger().sequence
resp = server.get_events(start_ledger=max(1, latest-1000), filters=filters, limit=100)
for evt in resp.events:
    print(evt.topic)
    print(evt.value)
