'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { buildJoinRoomTx, submitJoinRoomTx } from '@/lib/stellar/multi-room';
import { Room } from '@/lib/api/types';

export function useJoinRoom(room: Room | undefined) {
  const router = useRouter();
  const [isWeb3Processing, setIsWeb3Processing] = useState(false);

  const handleJoin = async () => {
    console.log(room)

    setIsWeb3Processing(true);
    try {
      const { requestAccess, getNetwork, signTransaction } = await import("@stellar/freighter-api");
      const { config } = await import("@/lib/stellar/transactions");

      const { address: senderAddress, error: addrErr } = await requestAccess();
      if (addrErr || !senderAddress) {
        alert("Could not read address from Freighter. Please unlock your wallet and try again.");
        setIsWeb3Processing(false);
        return;
      }

      const { network: freighterNetwork } = await getNetwork();
      const expectedNetwork = process.env.NEXT_PUBLIC_STELLAR_NETWORK || "TESTNET";
      if (freighterNetwork && freighterNetwork.toUpperCase() !== expectedNetwork.toUpperCase()) {
        alert(`Wallet is on ${freighterNetwork} but app expects ${expectedNetwork}. Please switch networks in Freighter.`);
        setIsWeb3Processing(false);
        return;
      }

      if (!room) {
        alert("Room data is not available. Please try again.");
        setIsWeb3Processing(false);
        return;
      }

      if (room.room_id == null) {
        alert("Room ID is missing. Please refresh and try again.");
        setIsWeb3Processing(false);
        return;
      }

      const xdr = await buildJoinRoomTx(senderAddress, room.room_id);

      const { signedTxXdr, error: signError } = await signTransaction(xdr, {
        networkPassphrase: config.networkPassphrase,
        address: senderAddress,
      });

      if (signError) {
        throw new Error(signError.message || "Transaction signing rejected by user");
      }
      if (!signedTxXdr) {
        throw new Error("Freighter returned empty signed XDR");
      }

      await submitJoinRoomTx(signedTxXdr);

      alert(`Success! You have joined "${room.title}".`);
      window.location.reload();
    } catch (err: any) {
      console.error("Transaction failed:", err);
      // Check for common error strings
      const errorStr = JSON.stringify(err);
      if (errorStr.includes("Already joined") || (err.message && err.message.includes("Already joined"))) {
        alert("You have already joined this room!");
      } else if (errorStr.includes("Room is full")) {
        alert("Room is already full.");
      } else if (errorStr.includes("UnreachableCodeReached") || errorStr.includes("InvalidAction")) {
        alert("Cannot join right now. Please make sure the claim session has already started and you are not the room creator.");
      } else {
        alert(err.message || "Transaction failed. Please try again.");
      }
    } finally {
      setIsWeb3Processing(false);
    }
  };

  return {
    handleJoin,
    isJoining: isWeb3Processing
  };
}
