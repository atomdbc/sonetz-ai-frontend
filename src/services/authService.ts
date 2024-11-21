// src/services/authService.ts
import axios from 'axios';
import { SignInCredentials, SignUpCredentials, AuthResponse, User } from '@/types/auth';
import { TokenService } from '@/lib/auth/tokenService';
import { BASE_URL } from '@/lib/api//apiClient';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const token = TokenService.getAccessToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = TokenService.getRefreshToken();
      
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${BASE_URL}/refresh`, {
            refresh_token: refreshToken
          }, {
            headers: {
              'Content-Type': 'application/json'
            }
          });

          const newAccessToken = data.data.access_token;
          const newRefreshToken = data.data.refresh_token;
          
          TokenService.setTokens(newAccessToken, newRefreshToken);
          
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        } catch {
          TokenService.clearTokens();
          window.location.href = '/auth/signin';
          return Promise.reject(error);
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async signIn(credentials: SignInCredentials): Promise<AuthResponse> {
    const response = await axiosInstance.post<AuthResponse>('/signin', credentials);
    if (response.data.data) {
      const { access_token, refresh_token } = response.data.data;
      TokenService.setTokens(access_token, refresh_token);
    }
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const token = TokenService.getAccessToken();
    const response = await axiosInstance.get<User>('/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  },

  async signUp(credentials: SignUpCredentials): Promise<User> {
    const response = await axiosInstance.post<User>('/signup', credentials);
    return response.data;
  },

  async signOut(): Promise<void> {
    TokenService.clearTokens();
    window.location.href = '/auth/signin';
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await axiosInstance.post<AuthResponse>('/refresh', {
      refresh_token: refreshToken
    });
    return response.data;
  }
};