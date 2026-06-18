'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TOKENS } from '@/lib/data/tokens';
import { getFiatEquivalent } from '@/lib/utils/currency';

export function useCreateRoomState() {
  const router = useRouter();

  // Form states
  const [roomIdentity, setRoomIdentity] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const [roomCapacity, setRoomCapacity] = useState<number | ''>('');
  const [totalWinners, setTotalWinners] = useState<number | ''>('');
  const [claimSession, setClaimSession] = useState('');
  const [tokenId, setTokenId] = useState('XLM');
  const [rewardAmount, setRewardAmount] = useState('');

  const activeToken = TOKENS[tokenId] || TOKENS.XLM;

  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (!roomIdentity.trim()) {
      alert('Please fill out the Room Identity.');
      return;
    }
    if (!roomDescription.trim()) {
      alert('Please fill out the Room Description.');
      return;
    }
    if (roomCapacity === '' || roomCapacity <= 0) {
      alert('Please enter a valid Room Capacity.');
      return;
    }
    if (totalWinners === '' || totalWinners <= 0) {
      alert('Please enter a valid number of Total Winners.');
      return;
    }
    if (Number(totalWinners) > Number(roomCapacity)) {
      alert('Total Winners cannot be greater than Room Capacity.');
      return;
    }
    if (!claimSession) {
      alert('Please select when the claim session starts.');
      return;
    }
    if (!rewardAmount || parseFloat(rewardAmount) <= 0) {
      alert('Please enter a valid reward pool amount.');
      return;
    }

    // Success simulation
    alert(`Success! Room "${roomIdentity}" has been created.`);
    router.push('/community/myrooms');
  };

  // Draft save handler
  const handleSaveDraft = () => {
    if (!roomIdentity.trim()) {
      alert('Please enter a Room Identity to save as draft.');
      return;
    }
    alert(`Room "${roomIdentity}" has been saved as draft.`);
    router.push('/community/myrooms');
  };

  const getFiatEquivalentText = (amount: string) => {
    return getFiatEquivalent(amount, tokenId);
  };

  return {
    roomIdentity,
    setRoomIdentity,
    roomDescription,
    setRoomDescription,
    roomCapacity,
    setRoomCapacity,
    totalWinners,
    setTotalWinners,
    claimSession,
    setClaimSession,
    tokenId,
    setTokenId,
    rewardAmount,
    setRewardAmount,
    activeToken,
    getFiatEquivalentText,
    handleSubmit,
    handleSaveDraft,
  };
}
