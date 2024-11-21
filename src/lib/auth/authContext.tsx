// src/lib/auth/authContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { User, AuthContextType } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';
import { TokenService } from './tokenService';

interface ExtendedAuthContextType extends AuthContextType {
  token: string | null;
}

const AuthContext = createContext<ExtendedAuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const refreshTokenIfNeeded = async () => {
    const currentToken = TokenService.getAccessToken();
    const refreshToken = TokenService.getRefreshToken();

    if (!TokenService.isTokenValid(currentToken) && refreshToken) {
      try {
        const response = await authService.refreshToken(refreshToken);
        if (response.data?.access_token) {
          TokenService.setTokens(response.data.access_token, response.data.refresh_token);
          setToken(response.data.access_token);
          return response.data.access_token;
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        await signOut();
      }
    }
    return currentToken;
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const validToken = await refreshTokenIfNeeded();
      if (validToken) {
        const user = await authService.getCurrentUser();
        setUser(user);
        setToken(validToken);
      } else {
        setUser(null);
        setToken(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const user = await authService.signUp({ email, password, name });
      return user;
    } catch (error) {
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authService.signIn({ username: email, password });
      if (response.status === 'success' && response.data) {
        setToken(response.data.access_token);
        const user = await authService.getCurrentUser();
        setUser(user);
        return user;
      }
      throw new Error('Sign in failed');
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setToken(null); 
      router.push('/auth/signin');
      toast({
        title: 'Signed out successfully',
        description: 'Come back soon!',
      });
    } catch (error) {
      toast({
        title: 'Error signing out',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, token, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};