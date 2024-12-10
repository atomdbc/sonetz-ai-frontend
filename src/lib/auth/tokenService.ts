import { setCookie, getCookie, deleteCookie } from 'cookies-next';

const TOKEN_CONFIG = {
  maxAge: 7 * 24 * 60 * 60,
  secure: false, // Set to false for localhost
  sameSite: 'lax' as const,
  path: '/',
  domain: 'localhost'
};

export const TokenService = {
  setTokens(accessToken: string, refreshToken: string) {
    // Try setting cookies with multiple approaches
    document.cookie = `access_token=${accessToken}; path=/; ${TOKEN_CONFIG.secure ? 'secure;' : ''} sameSite=lax`;
    document.cookie = `refresh_token=${refreshToken}; path=/; ${TOKEN_CONFIG.secure ? 'secure;' : ''} sameSite=lax`;
    
    // Also use cookies-next
    setCookie('access_token', accessToken, TOKEN_CONFIG);
    setCookie('refresh_token', refreshToken, TOKEN_CONFIG);
    
    // Keep localStorage as backup
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  },

  getAccessToken() {
    // Try cookie first, then localStorage
    const cookieToken = getCookie('access_token');
    const localToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    

    return cookieToken || localToken;
  },

  getRefreshToken() {
    const cookieToken = getCookie('refresh_token');
    const localToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
    return cookieToken || localToken;
  },

  clearTokens() {
    deleteCookie('access_token');
    deleteCookie('refresh_token');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  },

  isTokenValid(token: string | null | undefined): boolean {
    if (!token) return false;
    
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      const payload = JSON.parse(atob(parts[1]));
      const exp = payload.exp * 1000;
      
      return exp > (Date.now() + 5 * 60 * 1000);
    } catch {
      return false;
    }
  }
};