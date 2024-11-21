// src/lib/api/apiClient.ts
import axios from 'axios';
import { TokenService } from '@/lib/auth/tokenService';

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';

const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = TokenService.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
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
          });
          TokenService.setTokens(data.data.access_token, data.data.refresh_token);
          return apiClient(originalRequest);
        } catch {
          TokenService.clearTokens();
          window.location.href = '/auth/signin';
        }
      }
    }
    return Promise.reject(error);
  }
);

export { apiClient };