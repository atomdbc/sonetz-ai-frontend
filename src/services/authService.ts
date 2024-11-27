import { apiClient } from '@/lib/api/apiClient';
import { SignInCredentials, SignUpCredentials, AuthResponse, User } from '@/types/auth';
import { TokenService } from '@/lib/auth/tokenService';

export const authService = {
  async signIn(credentials: SignInCredentials): Promise<AuthResponse> {
    try {
      const payload = {
        username: credentials.email,
        password: credentials.password
      };

      const response = await apiClient.post<AuthResponse>('/auth/signin', payload);
      
      if (response.data?.data) {
        const { access_token, refresh_token } = response.data.data;
        TokenService.setTokens(access_token, refresh_token);
      }
      
      return response.data;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  },

  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<User>('/auth/users/me');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },

  async signUp(credentials: SignUpCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/signup', credentials);
      return response.data;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }
,

  async signOut(): Promise<void> {
    try {
      TokenService.clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/signin';
      }
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/refresh', {
        refresh_token: refreshToken
      });
      
      return response.data;
    } catch (error) {
      console.error('Refresh token error:', error);
      throw error;
    }
  }
};