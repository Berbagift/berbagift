import * as StellarSdk from "@stellar/stellar-sdk";
import { config } from "./transactions";
import { parseAmount } from "../utils/currency";

const SWAP_CONTRACT_ID = process.env.NEXT_PUBLIC_SWAP_CONTRACT_ID!;
const XLM_CONTRACT = process.env.NEXT_PUBLIC_XLM_SAC_ADDRESS!;
const RPK_CONTRACT = process.env.NEXT_PUBLIC_RPK_CONTRACT!;

const rpc = new StellarSdk.rpc.Server(config.rpcUrl);

export async function buildSwapTx(
  senderAddress: string,
  tokenIn: 'XLM' | 'RPK',
  amountIn: string,
  minAmountOut: string
): Promise<string> {
  const account = await rpc.getAccount(senderAddress);
  const contract = new StellarSdk.Contract(SWAP_CONTRACT_ID);

  const parsedAmountIn = BigInt(Math.round(parseAmount(amountIn) * 10_000_000));
  const parsedMinAmountOut = BigInt(Math.round(parseAmount(minAmountOut) * 10_000_000));

  const tokenInAddress = tokenIn === 'XLM' ? XLM_CONTRACT : RPK_CONTRACT;

  const senderScVal = new StellarSdk.Address(senderAddress).toScVal();
  const tokenInScVal = new StellarSdk.Address(tokenInAddress).toScVal();
  const amountInScVal = StellarSdk.nativeToScVal(parsedAmountIn, { type: "i128" });
  const minAmountOutScVal = StellarSdk.nativeToScVal(parsedMinAmountOut, { type: "i128" });

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(
      contract.call("swap", senderScVal, tokenInScVal, amountInScVal, minAmountOutScVal)
    )
    .setTimeout(180)
    .build();

  const simResult = await rpc.simulateTransaction(tx);
  if (StellarSdk.rpc.Api.isSimulationError(simResult)) {
    throw new Error("Simulation failed: " + simResult.error);
  }
  if (!simResult.transactionData) {
    throw new Error("No transaction data returned from simulation");
  }

  const assembledTx = StellarSdk.rpc.assembleTransaction(tx, simResult).build();
  return assembledTx.toXDR();
}

export async function buildDepositTx(
  senderAddress: string,
  amountA: string,
  amountB: string
): Promise<string> {
  const account = await rpc.getAccount(senderAddress);
  const contract = new StellarSdk.Contract(SWAP_CONTRACT_ID);

  const parsedAmountA = BigInt(Math.round(parseAmount(amountA) * 10_000_000));
  const parsedAmountB = BigInt(Math.round(parseAmount(amountB) * 10_000_000));

  const senderScVal = new StellarSdk.Address(senderAddress).toScVal();
  const amountAScVal = StellarSdk.nativeToScVal(parsedAmountA, { type: "i128" });
  const amountBScVal = StellarSdk.nativeToScVal(parsedAmountB, { type: "i128" });

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(
      contract.call("deposit", senderScVal, amountAScVal, amountBScVal)
    )
    .setTimeout(180)
    .build();

  const simResult = await rpc.simulateTransaction(tx);
  if (StellarSdk.rpc.Api.isSimulationError(simResult)) {
    throw new Error("Deposit Simulation failed: " + simResult.error);
  }
  if (!simResult.transactionData) {
    throw new Error("No transaction data returned from simulation");
  }

  const assembledTx = StellarSdk.rpc.assembleTransaction(tx, simResult).build();
  return assembledTx.toXDR();
}

export async function getReserves(): Promise<{ reserveA: number, reserveB: number }> {
  try {
    const account = new StellarSdk.Account("GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF", "0");
    const contract = new StellarSdk.Contract(SWAP_CONTRACT_ID);

    const tx = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: config.networkPassphrase,
    })
      .addOperation(
        contract.call("get_reserves")
      )
      .setTimeout(180)
      .build();

    const simResult = await rpc.simulateTransaction(tx);
    if (StellarSdk.rpc.Api.isSimulationSuccess(simResult) && simResult.result) {
      const resultVal = simResult.result.retval;
      const arr = StellarSdk.scValToNative(resultVal) as [bigint, bigint];
      return {
        reserveA: Number(arr[0]) / 10_000_000,
        reserveB: Number(arr[1]) / 10_000_000,
      };
    }
  } catch (err) {
    console.error("Failed to fetch reserves", err);
  }
  return { reserveA: 5, reserveB: 8000 };
}
