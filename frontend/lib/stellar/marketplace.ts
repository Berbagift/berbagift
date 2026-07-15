import * as StellarSdk from "@stellar/stellar-sdk";
import { config } from "./transactions";

const MARKETPLACE_CONTRACT_ID =
  process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ID || "";

const rpc = new StellarSdk.rpc.Server(config.rpcUrl);

function dummyAccount(): StellarSdk.Account {
  return new StellarSdk.Account(StellarSdk.Keypair.random().publicKey(), "0");
}

/**
 * Lists an NFT on the marketplace.
 */
export async function buildListItemTx(
  sellerAddress: string,
  tokenId: number,
  paymentTokenAddress: string,
  priceStr: string
): Promise<string> {
  const account = await rpc.getAccount(sellerAddress);
  const contract = new StellarSdk.Contract(MARKETPLACE_CONTRACT_ID);

  const priceParsed = parseFloat(priceStr);
  if (isNaN(priceParsed) || priceParsed <= 0) throw new Error("Invalid price");
  const priceStroops = BigInt(Math.round(priceParsed * 10_000_000));

  const sellerScVal = new StellarSdk.Address(sellerAddress).toScVal();
  const tokenIdScVal = StellarSdk.nativeToScVal(tokenId, { type: "u32" });
  const paymentTokenScVal = new StellarSdk.Address(paymentTokenAddress).toScVal();
  const priceScVal = StellarSdk.nativeToScVal(priceStroops, { type: "i128" });

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(
      contract.call("list_item", sellerScVal, tokenIdScVal, paymentTokenScVal, priceScVal)
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

/**
 * Buys an NFT on the marketplace.
 */
export async function buildBuyItemTx(
  buyerAddress: string,
  tokenId: number
): Promise<string> {
  const account = await rpc.getAccount(buyerAddress);
  const contract = new StellarSdk.Contract(MARKETPLACE_CONTRACT_ID);

  const buyerScVal = new StellarSdk.Address(buyerAddress).toScVal();
  const tokenIdScVal = StellarSdk.nativeToScVal(tokenId, { type: "u32" });

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(contract.call("buy_item", buyerScVal, tokenIdScVal))
    .setTimeout(180)
    .build();

  const simResult = await rpc.simulateTransaction(tx);
  if (StellarSdk.rpc.Api.isSimulationError(simResult)) {
    throw new Error("Simulation failed: " + simResult.error);
  }

  const preparedTx = StellarSdk.rpc.assembleTransaction(tx, simResult).build();
  return preparedTx.toXDR();
}

/**
 * Cancels a marketplace listing.
 */
export async function buildCancelListingTx(
  sellerAddress: string,
  tokenId: number
): Promise<string> {
  const account = await rpc.getAccount(sellerAddress);
  const contract = new StellarSdk.Contract(MARKETPLACE_CONTRACT_ID);

  const sellerScVal = new StellarSdk.Address(sellerAddress).toScVal();
  const tokenIdScVal = StellarSdk.nativeToScVal(tokenId, { type: "u32" });

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(contract.call("cancel_listing", sellerScVal, tokenIdScVal))
    .setTimeout(180)
    .build();

  const simResult = await rpc.simulateTransaction(tx);
  if (StellarSdk.rpc.Api.isSimulationError(simResult)) {
    throw new Error("Simulation failed: " + simResult.error);
  }

  const preparedTx = StellarSdk.rpc.assembleTransaction(tx, simResult).build();
  return preparedTx.toXDR();
}

export interface ListingDetail {
  seller: string;
  paymentToken: string;
  price: string;
  isActive: boolean;
}

/**
 * Reads listing details from the contract.
 */
export async function getListingDetail(tokenId: number): Promise<ListingDetail | null> {
  const contract = new StellarSdk.Contract(MARKETPLACE_CONTRACT_ID);

  const tx = new StellarSdk.TransactionBuilder(dummyAccount(), {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(
      contract.call("get_listing_detail", StellarSdk.nativeToScVal(tokenId, { type: "u32" }))
    )
    .setTimeout(30)
    .build();

  const sim = await rpc.simulateTransaction(tx);
  if (StellarSdk.rpc.Api.isSimulationError(sim)) {
    return null;
  }

  if (sim.result) {
    const val = StellarSdk.scValToNative(sim.result.retval);
    return {
      seller: val.seller,
      paymentToken: val.payment_token,
      price: (Number(val.price) / 10_000_000).toString(),
      isActive: val.is_active,
    };
  }

  return null;
}
