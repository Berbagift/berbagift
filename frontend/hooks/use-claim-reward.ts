'use client';

import { useState } from 'react';
import { buildClaimRewardTx, submitClaimRewardTx } from '@/lib/stellar/multi-room';
import { Room } from '@/lib/api/types';

export function useClaimRewardWeb3(room: Room | undefined) {
  const [isClaiming, setIsClaiming] = useState(false);

  const handleClaimWeb3 = async () => {
    setIsClaiming(true);
    try {
      const { requestAccess, getNetwork, signTransaction } = await import("@stellar/freighter-api");
      const { config } = await import("@/lib/stellar/transactions");

      const { address: senderAddress, error: addrErr } = await requestAccess();
      if (addrErr || !senderAddress) {
        alert("Could not read address from Freighter. Please unlock your wallet and try again.");
        setIsClaiming(false);
        return;
      }

      const { network: freighterNetwork } = await getNetwork();
      const expectedNetwork = process.env.NEXT_PUBLIC_STELLAR_NETWORK || "TESTNET";
      if (freighterNetwork && freighterNetwork.toUpperCase() !== expectedNetwork.toUpperCase()) {
        alert(`Wallet is on ${freighterNetwork} but app expects ${expectedNetwork}. Please switch networks in Freighter.`);
        setIsClaiming(false);
        return;
      }

      const xdr = await buildClaimRewardTx(senderAddress, room.room_id);

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

      await submitClaimRewardTx(signedTxXdr);

      alert(`Success! You have claimed your reward for "${room.title}".`);
      window.location.reload();
    } catch (err: any) {
      console.error("Claim transaction failed:", err);
      // Check for common error strings
      const errorStr = JSON.stringify(err);
      if (errorStr.includes("Reward already claimed") || (err.message && err.message.includes("Reward already claimed"))) {
        alert("You have already claimed this reward!");
      } else if (errorStr.includes("Not a winner")) {
        alert("Sorry, you are not a winner in this room.");
      } else {
        alert(err.message || "Claim transaction failed. Please try again.");
      }
    } finally {
      setIsClaiming(false);
    }
  };

  return {
    handleClaimWeb3,
    isClaiming
  };
}
