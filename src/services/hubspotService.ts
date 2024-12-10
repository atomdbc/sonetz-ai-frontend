// src/services/hubspotService.ts
import { apiClient } from '@/lib/api/apiClient';
import { TokenStoreRequest } from '@/types/integrations.hubspot';

class HubSpotService {
  async storeTokens(tokens: TokenStoreRequest) {
    try {
      const response = await apiClient.post(
        '/integration/hubspot/store-token',
        tokens
      );
      return response.data;
    } catch (error) {
      console.error('Failed to store HubSpot tokens:', error);
      throw error;
    }
  }
}

export const hubspotService = new HubSpotService();