import envelopesData from '@/mockapi/envelopes.json';

export interface EnvelopeTemplate {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  isPremium?: boolean;
}

export const PRESET_ENVELOPES: EnvelopeTemplate[] = envelopesData as EnvelopeTemplate[];
