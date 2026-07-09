import os
from stellar_sdk import SorobanServer, TransactionBuilder, Network, Account, scval
from stellar_sdk.exceptions import BaseHorizonError

def test_balance():
    wallet_address = "GCVDTFSHBMD7KPKAIHAC5KHZPYPCJ3CA63TW5VTKGYVGA3NRPRSBZMJQ"
    contract_id = "CAXMJUKELFC7THVUKVH4NA5RYUDLORCKSZ5HTOPOMEXRMZJLFHKZJCQZ"
    
    server = SorobanServer("https://soroban-testnet.stellar.org")
    dummy = Account("GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5", 1)
    
    tx = (
        TransactionBuilder(
            source_account=dummy,
            network_passphrase=Network.TESTNET_NETWORK_PASSPHRASE,
            base_fee=100,
        )
        .append_invoke_contract_function_op(
            contract_id=contract_id,
            function_name="balance",
            parameters=[scval.to_address(wallet_address)],
        )
        .set_timeout(30)
        .build()
    )
    
    sim = server.simulate_transaction(tx)
    print("Simulation result:", sim)
    
test_balance()
