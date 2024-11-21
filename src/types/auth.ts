// src/types/auth.ts
export interface User {
    id: string;
    email: string;
    phone_number?: string;
    is_active: boolean;
  }
  
  export interface AuthContextType {
    user: User | null;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, name: string) => Promise<void>;
    signOut: () => Promise<void>;
  }
  
  export interface SignInCredentials {
    username: string;
    password: string;
  }
  
  export interface SignUpCredentials {
    email: string;
    password: string;
    name: string;
  }
  
  export interface AuthResponse {
    status: string;
    data?: {
      access_token: string;
      refresh_token: string;
      token_type: string;
    };
    message?: string;
  }