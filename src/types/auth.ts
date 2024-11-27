export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  status: string;
  message?: string;
  data?: {
    access_token: string;
    refresh_token: string;
    user?: User;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  // Add any other user fields your API returns
}

export interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string, name: string) => Promise<User>;
  signOut: () => Promise<void>;
}