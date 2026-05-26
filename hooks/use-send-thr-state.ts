import { useState } from 'react';
import { TOKENS, TokenConfig } from '@/lib/data/tokens';
import { getFiatEquivalent } from '@/lib/utils/currency';

export interface Recipient {
  id: string;
  username: string;
  initials: string;
}

const DEFAULT_RECIPIENTS: Recipient[] = [];

export function useSendThrState() {
  const [recipients, setRecipients] = useState<Recipient[]>(DEFAULT_RECIPIENTS);
  const [amount, setAmount] = useState<string>('345,65');
  const [message, setMessage] = useState<string>('');
  const [tokenId, setTokenId] = useState<string>('USDC');

  const activeToken = TOKENS[tokenId];

  const toggleToken = () => {
    setTokenId((prev) => (prev === 'USDC' ? 'XLM' : 'USDC'));
  };

  const addRecipient = (username: string) => {
    if (!username.trim()) return;
    const cleanUsername = username.trim().toLowerCase().replace(/^@/, '');
    
    // Avoid duplicates
    if (recipients.some(r => r.username.toLowerCase() === cleanUsername)) return;

    const initials = cleanUsername.slice(0, 2).toUpperCase();
    const newRecipient: Recipient = {
      id: Date.now().toString(),
      username: cleanUsername,
      initials,
    };
    setRecipients([...recipients, newRecipient]);
  };

  const removeRecipient = (id: string) => {
    setRecipients(recipients.filter((r) => r.id !== id));
  };

  const handleAmountChange = (val: string) => {
    setAmount(val);
  };

  const handleMessageChange = (val: string) => {
    setMessage(val);
  };

  return {
    recipients,
    amount,
    message,
    activeToken,
    toggleToken,
    setTokenId,
    addRecipient,
    removeRecipient,
    handleAmountChange,
    handleMessageChange,
    getFiatEquivalent: (amt: string) => getFiatEquivalent(amt, tokenId),
  };
}
