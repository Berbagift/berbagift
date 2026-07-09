import * as StellarSdk from "@stellar/stellar-sdk";

async function test() {
  const rpc = new StellarSdk.rpc.Server("https://soroban-testnet.stellar.org");
  const contractId = "CAXMJUKELFC7THVUKVH4NA5RYUDLORCKSZ5HTOPOMEXRMZJLFHKZJCQZ";
  const contract = new StellarSdk.Contract(contractId);
  const account = new StellarSdk.Account("GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5", "1");
  
  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: StellarSdk.Networks.TESTNET,
  })
  .addOperation(contract.call("decimals"))
  .setTimeout(30)
  .build();
  
  const sim = await rpc.simulateTransaction(tx);
  if (StellarSdk.rpc.Api.isSimulationSuccess(sim)) {
    console.log("Decimals:", StellarSdk.scValToNative(sim.result.retval));
  } else {
    console.log("Sim failed:", sim);
  }
}
test();
