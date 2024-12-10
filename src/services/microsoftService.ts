// src/services/microsoftService.ts
import { apiClient } from '@/lib/api/apiClient';
import {TokenStoreRequest } from '@/types/integrations.microsoft'



class MicrosoftService {
  async storeTokens(tokens: TokenStoreRequest) {
    try {
      const response = await apiClient.post(
        '/integration/microsoft/store-token',
        tokens
      );
      return response.data;
    } catch (error) {
      console.error('Failed to store tokens:', error);
      throw error;
    }
  }
}

export const microsoftService = new MicrosoftService();