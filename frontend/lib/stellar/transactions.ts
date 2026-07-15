import * as StellarSdk from "@stellar/stellar-sdk";

const NETWORK = process.env.NEXT_PUBLIC_STELLAR_NETWORK || "testnet";

export const config = {
  testnet: {
    horizonUrl: "https://horizon-testnet.stellar.org",
    rpcUrl: "https://soroban-testnet.stellar.org",
    networkPassphrase: StellarSdk.Networks.TESTNET,
  },
  mainnet: {
    horizonUrl: "https://horizon.stellar.org",
    rpcUrl: process.env.NEXT_PUBLIC_STELLAR_MAINNET_RPC_URL || "",
    networkPassphrase: StellarSdk.Networks.PUBLIC,
  },
}[NETWORK.toLowerCase()] || {
  horizonUrl: "https://horizon-testnet.stellar.org",
  rpcUrl: "https://soroban-testnet.stellar.org",
  networkPassphrase: StellarSdk.Networks.TESTNET,
};

export const horizon = new StellarSdk.Horizon.Server(config.horizonUrl);
// export const rpc = new StellarSdk.rpc.Server(config.rpcUrl);

/**
 * Builds a payment transaction to one or multiple destinations.
 */
export async function buildPaymentTx(
  sourceAddress: string,
  destinations: { address: string; amount: string }[],
  assetId: string // 'XLM' or 'RPK'
) {
  const account = await horizon.loadAccount(sourceAddress);

  let asset: StellarSdk.Asset;
  if (assetId === 'RPK') {
    const issuer = process.env.NEXT_PUBLIC_RPK_CONTRACT || "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
    asset = new StellarSdk.Asset("RPK", issuer);
  } else {
    asset = StellarSdk.Asset.native();
  }

  let transactionBuilder = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: config.networkPassphrase,
  });

  // Add a payment operation for each destination
  let totalAmount = 0;
  for (const dest of destinations) {
    totalAmount += parseFloat(dest.amount);
    transactionBuilder = transactionBuilder.addOperation(
      StellarSdk.Operation.payment({
        destination: dest.address,
        asset: asset,
        amount: dest.amount,
      })
    );
  }

  // Add admin fee of 0.5%
  const adminFeeAmount = (totalAmount * 0.005).toFixed(7); // Stellar uses 7 decimals precision
  const adminAddress = "GB2LOMIXDEAGNRBU7IO4DORD2MTEL6K2YWT3VJ62EEEWG4PJELPOAIZP";
  
  if (parseFloat(adminFeeAmount) > 0) {
    transactionBuilder = transactionBuilder.addOperation(
      StellarSdk.Operation.payment({
        destination: adminAddress,
        asset: asset,
        amount: adminFeeAmount,
      })
    );
  }

  const transaction = transactionBuilder.setTimeout(180).build();
  return transaction.toXDR();
}

/**
 * Submits a signed XDR string to the Horizon server.
 */
export async function submitTransaction(signedXdr: string) {
  const transaction = StellarSdk.TransactionBuilder.fromXDR(
    signedXdr,
    config.networkPassphrase
  ) as StellarSdk.Transaction;

  const response = await horizon.submitTransaction(transaction);
  return {
    hash: response.hash,
    ledger: response.ledger,
  };
}
