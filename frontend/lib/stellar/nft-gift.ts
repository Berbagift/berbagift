import * as StellarSdk from "@stellar/stellar-sdk";
import { config } from "./transactions";

const NFT_GIFT_CONTRACT_ID =
  process.env.NEXT_PUBLIC_NFT_GIFT_CONTRACT_ID ||
  "CAUZT6BVWEM7AI2GFW5PDWWMR7KZMMU3SIRGQ5CV5HZYHSN23N72BRAM";

const rpc = new StellarSdk.rpc.Server(config.rpcUrl);

export interface NftGiftRecipient {
  walletAddress: string;
  amount: string;      // human-readable, e.g. "10.5"
  message: string;
  tokenUri: string;
}

/**
 * We now call specific functions instead of passing tokenChoice
 */
function getFunctionName(tokenId: string): string {
  return tokenId === "XLM" ? "send_batch_xlm_and_nft" : "send_batch_rpk_and_nft";
}

/**
 * Converts a human-readable token amount string to Soroban i128 (stroops for XLM, base units for RPK).
 * Stellar uses 7 decimal places (1 XLM = 10_000_000 stroops).
 */
function toStroops(amount: string): bigint {
  const parsed = parseFloat(amount);
  if (isNaN(parsed)) return 0n;
  return BigInt(Math.round(parsed * 10_000_000));
}

/**
 * Builds, simulates, and assembles the Soroban transaction to call
 * `send_batch_xlm_and_nft` or `send_batch_rpk_and_nft` on the BagiTHR NFT contract.
 * Returns the XDR of the assembled (ready-to-sign) transaction.
 */
export async function buildNftGiftTx(
  senderAddress: string,
  tokenId: string, // 'XLM' | 'RPK'
  recipients: NftGiftRecipient[]
): Promise<string> {
  if (recipients.length === 0) throw new Error("No recipients provided");
  if (recipients.length > 3) throw new Error("Max 3 recipients per batch");

  const account = await rpc.getAccount(senderAddress);
  const contract = new StellarSdk.Contract(NFT_GIFT_CONTRACT_ID);

  // Build Soroban XDR argument vectors
  const recipientAddrs = StellarSdk.nativeToScVal(
    recipients.map((r) => StellarSdk.Address.fromString(r.walletAddress)),
    { type: "address" }
  );

  const tokenAmounts = StellarSdk.nativeToScVal(
    recipients.map((r) => toStroops(r.amount)),
    { type: "i128" }
  );

  const functionName = getFunctionName(tokenId);

  const tokenUris = StellarSdk.nativeToScVal(
    recipients.map((r) => r.tokenUri),
    { type: "string" }
  );

  const messages = StellarSdk.nativeToScVal(
    recipients.map((r) => r.message),
    { type: "string" }
  );

  const senderScVal = new StellarSdk.Address(senderAddress).toScVal();


  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(
      contract.call(
        functionName,
        senderScVal,
        recipientAddrs,
        tokenAmounts,
        tokenUris,
        messages
      )
    )
    .setTimeout(180)
    .build();


  // Simulate to estimate resource fees and populate the footprint
  const simResult = await rpc.simulateTransaction(tx);

  if (StellarSdk.rpc.Api.isSimulationError(simResult)) {
    throw new Error("Simulation failed: " + simResult.error);
  }

  // Assemble: merge sim results back into the transaction
  const preparedTx = StellarSdk.rpc.assembleTransaction(
    tx,
    simResult
  ).build();

  return preparedTx.toXDR();
}

/**
 * Submits a signed XDR string to Soroban RPC.
 */
export async function submitNftGiftTx(signedXdr: string) {
  const tx = StellarSdk.TransactionBuilder.fromXDR(
    signedXdr,
    config.networkPassphrase
  ) as StellarSdk.Transaction;

  const sendResult = await rpc.sendTransaction(tx);

  if (sendResult.status === "ERROR") {
    throw new Error("Transaction submission failed: " + JSON.stringify(sendResult.errorResult));
  }

  // Poll until the transaction is confirmed
  let getResult = await rpc.getTransaction(sendResult.hash);
  let retries = 15;

  while (getResult.status === StellarSdk.rpc.Api.GetTransactionStatus.NOT_FOUND && retries > 0) {
    await new Promise((res) => setTimeout(res, 2000));
    getResult = await rpc.getTransaction(sendResult.hash);
    retries--;
  }

  if (getResult.status === StellarSdk.rpc.Api.GetTransactionStatus.SUCCESS) {
    return { hash: sendResult.hash, status: "success" };
  } else if (getResult.status === StellarSdk.rpc.Api.GetTransactionStatus.FAILED) {
    throw new Error("Transaction failed on ledger: " + JSON.stringify(getResult));
  }

  throw new Error("Transaction timed out waiting for confirmation");
}
