import { create } from 'zustand';
import { TOKENS, TokenConfig } from '@/lib/data/tokens';
import { getFiatEquivalent } from '@/lib/utils/currency';

export interface Recipient {
  id: string;
  username: string;
  initials: string;
}

export interface UploadedDesign {
  id: string;
  url: string;
  title: string;
}

export type UploadMode = 'preset' | 'upload';

interface SendThrState {
  // Transfer Form State
  recipients: Recipient[];
  amount: string;
  message: string;
  tokenId: string;
  activeToken: TokenConfig;
  
  // Envelope Selection State
  selectedTemplateId: string | null;
  uploadMode: UploadMode;
  uploadedDesigns: UploadedDesign[];
  selectedUploadedDesignId: string | null;
  status: 'form' | 'processing' | 'success' | 'error';

  // Actions
  toggleToken: () => void;
  setTokenId: (id: string) => void;
  addRecipient: (username: string) => void;
  removeRecipient: (id: string) => void;
  handleAmountChange: (val: string) => void;
  handleMessageChange: (val: string) => void;
  getFiatEquivalent: (amt: string) => string;

  setUploadMode: (mode: UploadMode) => void;
  setSelectedTemplateId: (id: string | null) => void;
  setSelectedUploadedDesignId: (id: string | null) => void;
  addUploadedDesign: (design: UploadedDesign) => void;
  removeUploadedDesign: (id: string) => void;
  setStatus: (status: 'form' | 'processing' | 'success' | 'error') => void;
}

const DEFAULT_RECIPIENTS: Recipient[] = [];

export const useSendThrStore = create<SendThrState>((set, get) => ({
  recipients: DEFAULT_RECIPIENTS,
  amount: '',
  message: '',
  tokenId: 'USDC',
  activeToken: TOKENS['USDC'],

  selectedTemplateId: 'preset-1', // Default selection
  uploadMode: 'preset',
  uploadedDesigns: [],
  selectedUploadedDesignId: null,
  status: 'form',

  toggleToken: () => set((state) => {
    const newId = state.tokenId === 'USDC' ? 'XLM' : 'USDC';
    return { tokenId: newId, activeToken: TOKENS[newId] };
  }),

  setTokenId: (id: string) => set(() => ({
    tokenId: id,
    activeToken: TOKENS[id] || TOKENS['USDC']
  })),

  addRecipient: (username: string) => set((state) => {
    if (!username.trim()) return state;
    const cleanUsername = username.trim().toLowerCase().replace(/^@/, '');
    
    // Avoid duplicates
    if (state.recipients.some(r => r.username.toLowerCase() === cleanUsername)) return state;

    const initials = cleanUsername.slice(0, 2).toUpperCase();
    const newRecipient: Recipient = {
      id: Date.now().toString(),
      username: cleanUsername,
      initials,
    };
    return { recipients: [...state.recipients, newRecipient] };
  }),

  removeRecipient: (id: string) => set((state) => ({
    recipients: state.recipients.filter((r) => r.id !== id)
  })),

  handleAmountChange: (val: string) => set({ amount: val }),
  
  handleMessageChange: (val: string) => set({ message: val }),

  getFiatEquivalent: (amt: string) => getFiatEquivalent(amt, get().tokenId),

  setUploadMode: (mode: UploadMode) => set({ uploadMode: mode }),
  
  setSelectedTemplateId: (id: string | null) => set({ selectedTemplateId: id, selectedUploadedDesignId: null }),
  
  setSelectedUploadedDesignId: (id: string | null) => set({ selectedUploadedDesignId: id, selectedTemplateId: null }),

  addUploadedDesign: (design: UploadedDesign) => set((state) => ({
    uploadedDesigns: [...state.uploadedDesigns, design],
    selectedUploadedDesignId: design.id,
    selectedTemplateId: null,
  })),

  removeUploadedDesign: (id: string) => set((state) => ({
    uploadedDesigns: state.uploadedDesigns.filter((d) => d.id !== id),
    selectedUploadedDesignId: state.selectedUploadedDesignId === id ? null : state.selectedUploadedDesignId
  })),

  setStatus: (status) => set({ status }),
}));

// Provide a backward-compatible hook for components that used useSendThrState
export function useSendThrState() {
  return useSendThrStore();
}
