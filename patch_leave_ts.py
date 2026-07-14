import re

with open("frontend/lib/stellar/multi-room.ts", "r") as f:
    content = f.read()

new_functions = """
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
"""

content = content + "\n" + new_functions

with open("frontend/lib/stellar/multi-room.ts", "w") as f:
    f.write(content)
