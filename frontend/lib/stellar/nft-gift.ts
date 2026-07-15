import * as StellarSdk from "@stellar/stellar-sdk";
import { config } from "./transactions";
import { parseAmount } from "../utils/currency";

const NFT_GIFT_CONTRACT_ID =
  process.env.NEXT_PUBLIC_NFT_GIFT_CONTRACT_ID ||
  "CAUZT6BVWEM7AI2GFW5PDWWMR7KZMMU3SIRGQ5CV5HZYHSN23N72BRAM";

const XLM_CONTRACT = process.env.NEXT_PUBLIC_XLM_SAC_ADDRESS || "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";
const RPK_CONTRACT = process.env.NEXT_PUBLIC_RPK_CONTRACT || "CAXMJUKELFC7THVUKVH4NA5RYUDLORCKSZ5HTOPOMEXRMZJLFHKZJCQZ";

const rpc = new StellarSdk.rpc.Server(config.rpcUrl);

/** Dummy source account for read-only simulateTransaction calls. */
function dummyAccount(): StellarSdk.Account {
  return new StellarSdk.Account(StellarSdk.Keypair.random().publicKey(), "0");
}

export interface NftGiftRecipient {
  walletAddress: string;
  amount: string;
  message: string;
  tokenUri: string;
}

export interface ForwardGiftRecipient {
  walletAddress: string;
  tokenId: number;
  amount: string;
  message: string;
}

function toStroops(amount: string): bigint {
  const parsed = parseAmount(amount);
  if (isNaN(parsed)) return BigInt(0);
  return BigInt(Math.round(parsed * 10_000_000));
}

export async function buildNftGiftTx(
  senderAddress: string,
  tokenAddress: string,
  recipients: NftGiftRecipient[]
): Promise<string> {
  if (recipients.length === 0) throw new Error("No recipients provided");
  if (recipients.length > 3) throw new Error("Max 3 recipients per batch");

  const account = await rpc.getAccount(senderAddress);
  const contract = new StellarSdk.Contract(NFT_GIFT_CONTRACT_ID);

  const recipientAddrs = StellarSdk.nativeToScVal(
    recipients.map((r) => StellarSdk.Address.fromString(r.walletAddress)),
    { type: "address" }
  );

  let actualTokenAddress = tokenAddress;
  if (tokenAddress === "XLM") actualTokenAddress = XLM_CONTRACT;
  else if (tokenAddress === "RPK") actualTokenAddress = RPK_CONTRACT;

  const tokenScVal = new StellarSdk.Address(actualTokenAddress).toScVal();

  const tokenAmountsScVal = StellarSdk.xdr.ScVal.scvVec(
    recipients.map((r) => StellarSdk.nativeToScVal(toStroops(r.amount), { type: "i128" }))
  );

  const functionName = "send_batch_gift";

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
        tokenScVal,
        recipientAddrs,
        tokenAmountsScVal,
        tokenUris,
        messages
      )
    )
    .setTimeout(180)
    .build();

  const simResult = await rpc.simulateTransaction(tx);

  if (StellarSdk.rpc.Api.isSimulationError(simResult)) {
    throw new Error("Simulation failed: " + simResult.error);
  }

  const preparedTx = StellarSdk.rpc.assembleTransaction(tx, simResult).build();
  return preparedTx.toXDR();
}

export async function submitNftGiftTx(signedXdr: string) {
  const tx = StellarSdk.TransactionBuilder.fromXDR(
    signedXdr,
    config.networkPassphrase
  ) as StellarSdk.Transaction;

  const sendResult = await rpc.sendTransaction(tx);

  if (sendResult.status === "ERROR") {
    throw new Error(
      "Transaction submission failed: " + JSON.stringify(sendResult.errorResult)
    );
  }

  let getResult = await rpc.getTransaction(sendResult.hash);
  let retries = 15;

  while (
    getResult.status === StellarSdk.rpc.Api.GetTransactionStatus.NOT_FOUND &&
    retries > 0
  ) {
    await new Promise((res) => setTimeout(res, 2000));
    getResult = await rpc.getTransaction(sendResult.hash);
    retries--;
  }

  if (getResult.status === StellarSdk.rpc.Api.GetTransactionStatus.SUCCESS) {
    let tokenId: number | null = null;
    try {
      const txLedger = (getResult as any).ledger;
      if (txLedger) {
        const eventsRes = await rpc.getEvents({
          startLedger: txLedger,
          filters: [{ type: "contract", contractIds: [NFT_GIFT_CONTRACT_ID] }],
          limit: 50,
        });
        for (const evt of eventsRes.events) {
          if (evt.txHash === sendResult.hash && evt.topic && evt.topic.length >= 4) {
            try {
              const t0 = StellarSdk.scValToNative(evt.topic[0]);
              if (t0 === "BndlSent") {
                tokenId = StellarSdk.scValToNative(evt.topic[3]);
                break;
              }
            } catch { continue; }
          }
        }
      }
    } catch (e) {
      console.warn("Failed to extract token_id via getEvents:", e);
    }
    return { hash: sendResult.hash, status: "success", tokenId };
  } else if (getResult.status === StellarSdk.rpc.Api.GetTransactionStatus.FAILED) {
    throw new Error("Transaction failed on ledger: " + JSON.stringify(getResult));
  }

  throw new Error("Transaction timed out waiting for confirmation");
}

export async function buildForwardGiftTx(
  senderAddress: string,
  tokenAddress: string,
  recipients: ForwardGiftRecipient[]
): Promise<string> {
  if (recipients.length === 0) throw new Error("No recipients provided");
  if (recipients.length > 3) throw new Error("Max 3 recipients per batch");

  const account = await rpc.getAccount(senderAddress);
  const contract = new StellarSdk.Contract(NFT_GIFT_CONTRACT_ID);

  const recipientAddrs = StellarSdk.nativeToScVal(
    recipients.map((r) => StellarSdk.Address.fromString(r.walletAddress)),
    { type: "address" }
  );

  const tokenIds = StellarSdk.nativeToScVal(
    recipients.map((r) => r.tokenId),
    { type: "u32" }
  );

  let actualTokenAddress = tokenAddress;
  if (tokenAddress === "XLM") actualTokenAddress = XLM_CONTRACT;
  else if (tokenAddress === "RPK") actualTokenAddress = RPK_CONTRACT;

  const tokenScVal = new StellarSdk.Address(actualTokenAddress).toScVal();

  const tokenAmountsScVal = StellarSdk.xdr.ScVal.scvVec(
    recipients.map((r) => StellarSdk.nativeToScVal(toStroops(r.amount), { type: "i128" }))
  );

  const messages = StellarSdk.nativeToScVal(
    recipients.map((r) => r.message),
    { type: "string" }
  );

  const senderScVal = new StellarSdk.Address(senderAddress).toScVal();
  const functionName = "send_batch_existing_gift";

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(
      contract.call(
        functionName,
        senderScVal,
        tokenScVal,
        recipientAddrs,
        tokenIds,
        tokenAmountsScVal,
        messages
      )
    )
    .setTimeout(180)
    .build();

  const simResult = await rpc.simulateTransaction(tx);
  if (StellarSdk.rpc.Api.isSimulationError(simResult)) {
    throw new Error("Simulation failed: " + simResult.error);
  }

  const preparedTx = StellarSdk.rpc.assembleTransaction(tx, simResult).build();
  return preparedTx.toXDR();
}

export async function getOwnerOf(tokenId: number): Promise<string> {
  const contract = new StellarSdk.Contract(NFT_GIFT_CONTRACT_ID);

  const tx = new StellarSdk.TransactionBuilder(dummyAccount(), {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(
      contract.call("owner_of", StellarSdk.nativeToScVal(tokenId, { type: "u32" }))
    )
    .setTimeout(30)
    .build();

  const sim = await rpc.simulateTransaction(tx);
  if (StellarSdk.rpc.Api.isSimulationError(sim) || !sim.result) {
    throw new Error("Simulation failed");
  }

  return StellarSdk.scValToNative(sim.result.retval);
}
