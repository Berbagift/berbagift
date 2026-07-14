'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { buildLeaveRoomTx, submitLeaveRoomTx } from '@/lib/stellar/multi-room';
import { Room } from '@/lib/api/types';

export function useLeaveRoomWeb3(room: Room | undefined) {
  const router = useRouter();
  const [isLeaving, setIsLeaving] = useState(false);

  const handleLeaveWeb3 = async () => {
    if (!room || !room.room_id) {
      alert("Invalid room data: missing room ID. Cannot leave.");
      return;
    }

    setIsLeaving(true);
    try {
      const { requestAccess, getNetwork, signTransaction } = await import("@stellar/freighter-api");
      const { config } = await import("@/lib/stellar/transactions");
      
      const { address: senderAddress, error: addrErr } = await requestAccess();
      if (addrErr || !senderAddress) {
        alert("Could not read address from Freighter. Please unlock your wallet and try again.");
        setIsLeaving(false);
        return;
      }
      
      const { network: freighterNetwork } = await getNetwork();
      const expectedNetwork = process.env.NEXT_PUBLIC_STELLAR_NETWORK || "TESTNET";
      if (freighterNetwork && freighterNetwork.toUpperCase() !== expectedNetwork.toUpperCase()) {
        alert(`Wallet is on ${freighterNetwork} but app expects ${expectedNetwork}. Please switch networks in Freighter.`);
        setIsLeaving(false);
        return;
      }

      const xdr = await buildLeaveRoomTx(senderAddress, room.room_id);
      
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
      
      await submitLeaveRoomTx(signedTxXdr);
      
      alert(`Success! You have left "${room.title}".`);
      router.push('/community/explore');
    } catch (err: any) {
      console.error("Leave transaction failed:", err);
      // Check for common error strings
      const errorStr = JSON.stringify(err);
      if (errorStr.includes("Not joined") || (err.message && err.message.includes("Not joined"))) {
          alert("You are not joined in this room!");
      } else {
          alert(err.message || "Leave transaction failed. Please try again.");
      }
    } finally {
      setIsLeaving(false);
    }
  };

  return {
    handleLeaveWeb3,
    isLeaving
  };
}
