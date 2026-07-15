import * as StellarSdk from "@stellar/stellar-sdk";
import { config } from "./transactions";
import { parseAmount } from "../utils/currency";

const MULTI_ROOM_CONTRACT_ID = process.env.NEXT_PUBLIC_MULTI_ROOM_CONTRACT_ID || "CANYHO2JONDBIKBCL4GCQKI6EFKRSIUMSOI2NYVA725U35JZPE3LIQHE";
const XLM_CONTRACT = process.env.NEXT_PUBLIC_XLM_SAC_ADDRESS || "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";
const RPK_CONTRACT = process.env.NEXT_PUBLIC_RPK_CONTRACT || "CAXMJUKELFC7THVUKVH4NA5RYUDLORCKSZ5HTOPOMEXRMZJLFHKZJCQZ";

const rpc = new StellarSdk.rpc.Server(config.rpcUrl);

export async function buildCreateRoomTx(
  senderAddress: string,
  tokenAddress: string,
  title: string,
  description: string,
  capacity: number,
  totalWinners: number,
  claimSessionStart: number, // unix timestamp in seconds
  rewardAmount: string
): Promise<string> {
  const account = await rpc.getAccount(senderAddress);
  const contract = new StellarSdk.Contract(MULTI_ROOM_CONTRACT_ID);

  const parsedAmount = BigInt(Math.round(parseAmount(rewardAmount) * 10_000_000));
  let actualTokenAddress = tokenAddress;
  if (tokenAddress === "XLM") actualTokenAddress = XLM_CONTRACT;
  else if (tokenAddress === "RPK") actualTokenAddress = RPK_CONTRACT;


  const senderScVal = new StellarSdk.Address(senderAddress).toScVal();
  const tokenScVal = new StellarSdk.Address(actualTokenAddress).toScVal();
  const titleScVal = StellarSdk.nativeToScVal(title, { type: 'string' });
  const descScVal = StellarSdk.nativeToScVal(description, { type: 'string' });
  const capacityScVal = StellarSdk.nativeToScVal(capacity, { type: 'u32' });
  const winnersScVal = StellarSdk.nativeToScVal(totalWinners, { type: 'u32' });
  const claimStartScVal = StellarSdk.nativeToScVal(claimSessionStart, { type: 'u64' });
  const rewardScVal = StellarSdk.nativeToScVal(parsedAmount, { type: 'i128' });

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(
      contract.call(
        "create_room",
        senderScVal,
        tokenScVal,
        titleScVal,
        descScVal,
        capacityScVal,
        winnersScVal,
        claimStartScVal,
        rewardScVal
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

export async function submitCreateRoomTx(signedXdr: string) {
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

export async function buildJoinRoomTx(
  senderAddress: string,
  roomId: number
): Promise<string> {
  const account = await rpc.getAccount(senderAddress);
  const contract = new StellarSdk.Contract(MULTI_ROOM_CONTRACT_ID);

  const senderScVal = new StellarSdk.Address(senderAddress).toScVal();
  const roomIdScVal = StellarSdk.nativeToScVal(roomId, { type: 'u32' });

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(
      contract.call(
        "join_room",
        senderScVal,
        roomIdScVal
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

export async function submitJoinRoomTx(signedXdr: string) {
  return submitCreateRoomTx(signedXdr); // Reuse the same submission logic
}

export async function getRoomParticipantsCount(roomId: number, publicKey: string): Promise<number> {
  try {
    const account = await rpc.getAccount(publicKey);
    const contract = new StellarSdk.Contract(MULTI_ROOM_CONTRACT_ID);

    const tx = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: config.networkPassphrase,
    })
      .addOperation(
        contract.call("get_participants", StellarSdk.nativeToScVal(roomId, { type: 'u32' }))
      )
      .setTimeout(30)
      .build();

    const simResult = await rpc.simulateTransaction(tx);
    if (StellarSdk.rpc.Api.isSimulationSuccess(simResult) && simResult.result) {
      const val = StellarSdk.scValToNative(simResult.result.retval);
      if (Array.isArray(val)) {
        return val.length;
      }
    }
    return 0;
  } catch (error) {
    console.error("Error fetching participants count for room", roomId, error);
    return 0;
  }
}

export async function buildClaimRewardTx(
  senderAddress: string,
  roomId: number
): Promise<string> {
  const account = await rpc.getAccount(senderAddress);
  const contract = new StellarSdk.Contract(MULTI_ROOM_CONTRACT_ID);

  const senderScVal = new StellarSdk.Address(senderAddress).toScVal();
  const roomIdScVal = StellarSdk.nativeToScVal(roomId, { type: 'u32' });

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(
      contract.call(
        "claim_reward",
        senderScVal,
        roomIdScVal
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

export async function submitClaimRewardTx(signedXdr: string) {
  return submitCreateRoomTx(signedXdr); // Reuse the same submission logic
}


export async function buildLeaveRoomTx(
  senderAddress: string,
  roomId: number
): Promise<string> {
  const account = await rpc.getAccount(senderAddress);
  const contract = new StellarSdk.Contract(MULTI_ROOM_CONTRACT_ID);

  const senderScVal = new StellarSdk.Address(senderAddress).toScVal();
  const roomIdScVal = StellarSdk.nativeToScVal(roomId, { type: 'u32' });

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(
      contract.call(
        "leave_room",
        senderScVal,
        roomIdScVal
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

export async function submitLeaveRoomTx(signedXdr: string) {
  return submitCreateRoomTx(signedXdr); // Reuse the same submission logic
}
