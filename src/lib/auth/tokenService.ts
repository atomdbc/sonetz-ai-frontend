import { setCookie, getCookie, deleteCookie } from 'cookies-next';

const TOKEN_CONFIG = {
  maxAge: 7 * 24 * 60 * 60, // 7 days
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/'
};

export const TokenService = {
  setTokens(accessToken: string, refreshToken: string) {
    setCookie('access_token', accessToken, TOKEN_CONFIG);
    setCookie('refresh_token', refreshToken, TOKEN_CONFIG);
  },

  getAccessToken() {
    return getCookie('access_token');
  },

  getRefreshToken() {
    return getCookie('refresh_token');
  },

  clearTokens() {
    deleteCookie('access_token');
    deleteCookie('refresh_token');
  },

  // New method to check if token needs refresh
  isTokenValid(token: string | null | undefined): boolean {
    if (!token) return false;
    
    try {
      // Decode the JWT token
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      const payload = JSON.parse(atob(parts[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      
      // Add some buffer time (5 minutes) before expiration
      return exp > (Date.now() + 5 * 60 * 1000);
    } catch {
      return false;
    }
  }
};