export interface TokenStoreRequest {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    scopes: string[];
  }
  
  export interface TokenStoreResponse {
    success: boolean;
    integration_id: string;
    expires_at: string;
  }