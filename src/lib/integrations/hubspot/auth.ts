// src/lib/integrations/hubspot/auth.ts
import { BaseIntegrationConfig } from '@/lib/integrations/types';

interface HubSpotConfig extends BaseIntegrationConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

class HubSpotAuthClient {
  private config: HubSpotConfig;

  constructor() {
    if (!process.env.NEXT_PUBLIC_HUBSPOT_CLIENT_ID) {
      throw new Error('NEXT_PUBLIC_HUBSPOT_CLIENT_ID is required');
    }

    this.config = {
      clientId: process.env.NEXT_PUBLIC_HUBSPOT_CLIENT_ID,
      clientSecret: process.env.HUBSPOT_CLIENT_SECRET || '',
      redirectUri: process.env.NEXT_PUBLIC_HUBSPOT_REDIRECT_URI || 'http://localhost:3000/integrations/hubspot/callback',
      scopes: [
        'crm.objects.contacts.write',
  'crm.objects.contacts.read',
  'crm.objects.deals.read',
  'crm.objects.deals.write',
  'crm.objects.leads.read',
  'crm.objects.leads.write',
  'oauth'
      ]
    };
  }

  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(' ')
    });

    return `https://app.hubspot.com/oauth/authorize?${params.toString()}`;
  }

  openAuthPopup(): Window | null {
    const authUrl = this.getAuthUrl();
    const width = 600;
    const height = 700;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;

    return window.open(
      authUrl,
      'Connect to HubSpot',
      `width=${width},height=${height},top=${top},left=${left},toolbar=no,location=no,status=no,menubar=no`
    );
  }
  async exchangeCodeForTokens(code: string) {
    const tokenEndpoint = 'https://api.hubapi.com/oauth/v1/token';
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      redirect_uri: this.config.redirectUri,
      code: code
    });

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    return response.json();
  }

  async refreshAccessToken(refreshToken: string) {
    const tokenEndpoint = 'https://api.hubapi.com/oauth/v1/token';
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      refresh_token: refreshToken
    });

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    if (!response.ok) {
      throw new Error('Failed to refresh access token');
    }

    return response.json();
  }
}

// Export a default instance
export { HubSpotAuthClient };