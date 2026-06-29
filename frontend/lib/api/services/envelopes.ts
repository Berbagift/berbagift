import { apiClient, unwrapApiData } from '../client';
import { EnvelopeTemplate } from '../types';
import envelopesData from '@/mockapi/envelopes.json';

const isLocalMode = process.env.NEXT_PUBLIC_API_MODE === 'local';

export const envelopesService = {
  /**
   * Retrieve list of preset design templates for sending THR.
   */
  getEnvelopes: async (): Promise<EnvelopeTemplate[]> => {
    if (isLocalMode) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return envelopesData as EnvelopeTemplate[];
    }

    const res = await apiClient.get<EnvelopeTemplate[] | { data: EnvelopeTemplate[] }>('/envelopes');
    return unwrapApiData<EnvelopeTemplate[]>(res.data);
  },
};
