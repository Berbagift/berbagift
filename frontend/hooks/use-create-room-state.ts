'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TOKENS } from '@/lib/data/tokens';
import { getFiatEquivalent } from '@/lib/utils/currency';
import { useCreateRoom as useCreateRoomMutation } from '@/lib/api/queries';
import { getErrorMessage } from '@/lib/api/client';
import { Room } from '@/lib/api/types';
import { buildCreateRoomTx, submitCreateRoomTx } from '@/lib/stellar/multi-room';
import { useQueryClient } from '@tanstack/react-query';

import { toast } from 'react-toastify';

export function useCreateRoomState() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Form states
  const [roomTitle, setRoomTitle] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const [roomCapacity, setRoomCapacity] = useState<number | ''>('');
  const [totalWinners, setTotalWinners] = useState<number | ''>('');
  const [claimSession, setClaimSession] = useState('');
  const [tokenId, setTokenId] = useState<'XLM' | 'RPK'>('XLM');
  const [rewardAmount, setRewardAmount] = useState('');
  const [isWeb3Processing, setIsWeb3Processing] = useState(false);
  
  const createRoomMutation = useCreateRoomMutation();

  const activeToken = TOKENS[tokenId] || TOKENS.XLM;

  const validateRequiredFields = (requireCompleteForm: boolean) => {
    if (!roomTitle.trim()) {
      toast.error('Please fill out the Room Identity.');
      return false;
    }
    if (!requireCompleteForm) return true;

    if (!roomDescription.trim()) {
      toast.error('Please fill out the Room Description.');
      return false;
    }
    if (roomCapacity === '' || roomCapacity <= 0) {
      toast.error('Please enter a valid Room Capacity.');
      return false;
    }
    if (totalWinners === '' || totalWinners <= 0) {
      toast.error('Please enter a valid number of Total Winners.');
      return false;
    }
    if (Number(totalWinners) > Number(roomCapacity)) {
      toast.error('Total Winners cannot be greater than Room Capacity.');
      return false;
    }
    if (!claimSession) {
      toast.error('Please select when the claim session starts.');
      return false;
    }
    
    // Check if the date is valid and in the future
    const claimDate = new Date(claimSession);
    if (isNaN(claimDate.getTime())) {
      toast.error('Please enter a valid date and time.');
      return false;
    }
    if (claimDate.getTime() < Date.now()) {
      toast.error('Claim session start time must be in the future.');
      return false;
    }

    if (!rewardAmount || parseFloat(rewardAmount) <= 0) {
      toast.error('Please enter a valid reward pool amount.');
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
        toast.success(successMessage);
        router.push('/community/myrooms');
      },
      onError: (error) => {
        toast.error(getErrorMessage(error, 'Failed to save room. Please try again.'));
      },
    });
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRequiredFields(true)) {
      return;
    }
    
    setIsWeb3Processing(true);
    
    try {
      const { requestAccess, getNetwork, signTransaction } = await import("@stellar/freighter-api");
      const { config } = await import("@/lib/stellar/transactions");
      
      const { address: senderAddress, error: addrErr } = await requestAccess();
      if (addrErr || !senderAddress) {
        toast.error("Could not read address from Freighter. Please unlock your wallet and try again.");
        setIsWeb3Processing(false);
        return;
      }
      
      const { network: freighterNetwork } = await getNetwork();
      const expectedNetwork = process.env.NEXT_PUBLIC_STELLAR_NETWORK || "TESTNET";
      if (freighterNetwork && freighterNetwork.toUpperCase() !== expectedNetwork.toUpperCase()) {
        toast.error(`Wallet is on ${freighterNetwork} but app expects ${expectedNetwork}. Please switch networks in Freighter.`);
        setIsWeb3Processing(false);
        return;
      }
      
      const claimStartTimestamp = Math.floor(new Date(claimSession).getTime() / 1000);
      
      const xdr = await buildCreateRoomTx(
        senderAddress,
        tokenId,
        roomTitle.trim(),
        roomDescription.trim(),
        Number(roomCapacity),
        Number(totalWinners),
        claimStartTimestamp,
        rewardAmount
      );
      
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
      
      await submitCreateRoomTx(signedTxXdr);
      
      // Refresh relevant data
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['myrooms'] });
      queryClient.invalidateQueries({ queryKey: ['exploreRooms'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['rooms'] });
        queryClient.invalidateQueries({ queryKey: ['myrooms'] });
        queryClient.invalidateQueries({ queryKey: ['exploreRooms'] });
        queryClient.invalidateQueries({ queryKey: ['activities'] });
        queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      }, 3000);
      
      toast.success(`Success! Room "${roomTitle}" has been created on the Stellar network.`);
      router.push('/community/myrooms');
    } catch (err: any) {
      console.error("Transaction failed:", err);
      toast.error(err.message || "Transaction failed. Please try again.");
    } finally {
      setIsWeb3Processing(false);
    }
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
    isSubmitting: createRoomMutation.isPending || isWeb3Processing,
  };
}
