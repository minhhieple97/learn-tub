'use client';

import { useQuery } from '@tanstack/react-query';
import { IPaymentDetails } from '../types';


export const usePaymentDetails = (sessionId: string | null) => {
  return useQuery({
    queryKey: ['paymentDetails', sessionId],
    queryFn: async () => {
      if (!sessionId) {
        throw new Error('No session ID found');
      }

      const response = await fetch(`/api/payment/session/${sessionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch payment details');
      }

      return response.json() as Promise<IPaymentDetails>;
    },
    enabled: !!sessionId,
  });
};
