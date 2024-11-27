// src/services/integrationService.ts

import { apiClient } from '@/lib/api/apiClient';

interface AuthResponse {
  authUrl: string;
}

class IntegrationService {
  async initiateAuth(integration: string) {
    try {
      const response = await apiClient.get<AuthResponse>(
        `/api/integrations/auth?integration=${integration}`
      );
      return response.data.authUrl;
    } catch (error) {
      console.error(`Error initiating ${integration} auth:`, error);
      throw error;
    }
  }

  // Add other integration-related methods here
}

export const integrationService = new IntegrationService();