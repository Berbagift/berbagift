'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TOKENS } from '@/lib/data/tokens';
import { getFiatEquivalent } from '@/lib/utils/currency';
import { useCreateRoom as useCreateRoomMutation } from '@/lib/api/queries';
import { getErrorMessage } from '@/lib/api/client';
import { Room } from '@/lib/api/types';

export function useCreateRoomState() {
  const router = useRouter();

  // Form states
  const [roomTitle, setRoomTitle] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const [roomCapacity, setRoomCapacity] = useState<number | ''>('');
  const [totalWinners, setTotalWinners] = useState<number | ''>('');
  const [claimSession, setClaimSession] = useState('');
  const [tokenId, setTokenId] = useState('XLM');
  const [rewardAmount, setRewardAmount] = useState('');
  const createRoomMutation = useCreateRoomMutation();

  const activeToken = TOKENS[tokenId] || TOKENS.XLM;

  const validateRequiredFields = (requireCompleteForm: boolean) => {
    if (!roomTitle.trim()) {
      alert('Please fill out the Room Identity.');
      return false;
    }
    if (!requireCompleteForm) return true;

    if (!roomDescription.trim()) {
      alert('Please fill out the Room Description.');
      return false;
    }
    if (roomCapacity === '' || roomCapacity <= 0) {
      alert('Please enter a valid Room Capacity.');
      return false;
    }
    if (totalWinners === '' || totalWinners <= 0) {
      alert('Please enter a valid number of Total Winners.');
      return false;
    }
    if (Number(totalWinners) > Number(roomCapacity)) {
      alert('Total Winners cannot be greater than Room Capacity.');
      return false;
    }
    if (!claimSession) {
      alert('Please select when the claim session starts.');
      return false;
    }
    if (!rewardAmount || parseFloat(rewardAmount) <= 0) {
      alert('Please enter a valid reward pool amount.');
      return false;
    }

    return true;
  };

  const buildRoomPayload = (status: Room['status']): Omit<Room, 'id'> => {
    const capacity = Number(roomCapacity) || 0;
    const winners = Number(totalWinners) || 0;
    const amount = parseFloat(rewardAmount.replace(',', '.')) || 0;

    return {
      title: roomTitle.trim(),
      description: roomDescription.trim(),
      creator: {
        username: '@nadifofficial',
        initials: 'NB',
        role: 'Room Creator',
      },
      rewardPool: `${rewardAmount || '0'} ${activeToken.symbol}`,
      rewardPoolIdr: getFiatEquivalent(rewardAmount || '0', tokenId),
      winners,
      joined: 0,
      maxParticipants: capacity,
      participants: [],
      activities: [],
      status,
      statusText: claimSession ? `Starts in ${claimSession}` : 'Draft room',
      isHighReward: amount >= 1000,
      isSaved: false,
      claimCountdown: null,
      createdAt: new Date().toISOString(),
    };
  };

  const persistRoom = (status: Room['status'], successMessage: string) => {
    createRoomMutation.mutate(buildRoomPayload(status), {
      onSuccess: () => {
        alert(successMessage);
        router.push('/community/myrooms');
      },
      onError: (error) => {
        alert(getErrorMessage(error, 'Failed to save room. Please try again.'));
      },
    });
  };

  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRequiredFields(true)) {
      return;
    }
    persistRoom('Upcoming', `Success! Room "${roomTitle}" has been created.`);
  };

  // Draft save handler
  const handleSaveDraft = () => {
    if (!validateRequiredFields(false)) {
      return;
    }
    persistRoom('Draft', `Room "${roomTitle}" has been saved as draft.`);
  };

  const getFiatEquivalentText = (amount: string) => {
    return getFiatEquivalent(amount, tokenId);
  };

  return {
    roomTitle,
    setRoomTitle,
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
    isSubmitting: createRoomMutation.isPending,
  };
}
