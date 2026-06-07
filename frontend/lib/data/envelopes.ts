export interface EnvelopeTemplate {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  isPremium?: boolean;
}

export const PRESET_ENVELOPES: EnvelopeTemplate[] = [
  {
    id: 'preset-1',
    title: 'Nature Green',
    imageUrl: 'https://placehold.co/600x400/e8f5e9/2e7d32?text=Nature+Green',
    category: 'nature',
  },
  {
    id: 'preset-2',
    title: 'Cheerful Purple',
    imageUrl: 'https://placehold.co/600x400/f3e5f5/7b1fa2?text=Cheerful+Purple',
    category: 'modern',
  },
  {
    id: 'preset-3',
    title: 'Calm Blue',
    imageUrl: 'https://placehold.co/600x400/e3f2fd/1565c0?text=Calm+Blue',
    category: 'classic',
  },
  {
    id: 'preset-4',
    title: 'Made for Couple',
    imageUrl: 'https://placehold.co/600x400/ffebee/c62828?text=Couple',
    category: 'family',
  },
  {
    id: 'preset-5',
    title: 'Made for Family',
    imageUrl: 'https://placehold.co/600x400/f1f8e9/558b2f?text=Family',
    category: 'family',
  },
  {
    id: 'preset-6',
    title: 'Sunshine Yellow',
    imageUrl: 'https://placehold.co/600x400/fff8e1/ff8f00?text=Sunshine',
    category: 'modern',
  },
];
