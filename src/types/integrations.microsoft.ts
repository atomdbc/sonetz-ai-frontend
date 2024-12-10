// types/integrations.microsoft.ts
export interface UserData {
  id: string;
  display_name: string;
  user_principal_name: string;
  given_name?: string;
  surname?: string;
  preferred_language?: string;
  job_title?: string | null;
  mobile_phone?: string | null;
  office_location?: string | null;
}

export interface TokenStoreRequest {
  access_token: string;
  refresh_token: string;
  email: string;
  expires_in: number;
  scopes: string[];
  user_data: UserData;
}