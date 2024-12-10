// src/lib/integrations/types.ts
export interface BaseIntegrationConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scopes: string[];
  }
  
  export interface TokenResponse {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
    scope?: string;
  }
  
  export interface IntegrationProvider {
    name: string;
    logo: string;
    description: string;
    authUrl: string;
  }
  