import axios from 'axios';
import { TokenService } from '@/lib/auth/tokenService';

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.sonetz.com';
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'wss://api.sonetz.com';

const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = TokenService.getAccessToken();
  console.log('Request URL:', config.url);
  console.log('Current token:', token);
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  console.log('Final headers:', config.headers);
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log('API Error Details:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.config?.headers
    });
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = TokenService.getRefreshToken();
      
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
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