// src/lib/integrations/microsoft/auth.ts
import { BaseIntegrationConfig } from '@/lib/integrations/types';

export class MicrosoftAuthClient {
  private config: BaseIntegrationConfig;
  private authority: string;

  constructor() {
    if (!process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID) {
      throw new Error('NEXT_PUBLIC_MICROSOFT_CLIENT_ID is required');
    }

    this.authority = process.env.MICROSOFT_AUTHORITY || 'https://login.microsoftonline.com/common';
    this.config = {
      clientId: process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
      redirectUri: process.env.NEXT_PUBLIC_MICROSOFT_REDIRECT_URI || 'http://localhost:3000/integrations/microsoft/callback',
      scopes: [
        'https://graph.microsoft.com/User.Read',
        'https://graph.microsoft.com/Mail.Send',
        'https://graph.microsoft.com/Mail.Read',
        'offline_access'
      ]
    };
  }

  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: 'code',
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(' '),
      prompt: 'consent'
    });

    return `${this.authority}/oauth2/v2.0/authorize?${params.toString()}`;
  }

  openAuthPopup(): Window | null {
    const authUrl = this.getAuthUrl();
    const width = 600;
    const height = 700;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;

    return window.open(
      authUrl,
      'Connect to Microsoft',
      `width=${width},height=${height},top=${top},left=${left},toolbar=no,location=no,status=no,menubar=no`
    );
  }

  async exchangeCodeForTokens(code: string) {
    const tokenEndpoint = `${this.authority}/oauth2/v2.0/token`;
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      code: code,
      redirect_uri: this.config.redirectUri,
      grant_type: 'authorization_code'
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
    const tokenEndpoint = `${this.authority}/oauth2/v2.0/token`;
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
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