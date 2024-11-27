// src/components/auth/ProtectedRoute.tsx

'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/authContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleNavigation = async () => {
      if (!user && !pathname.startsWith('/auth')) {
        // Use replace instead of push to prevent back button issues
        router.replace('/auth/signin');
      }

      if (user && pathname.startsWith('/auth')) {
        // Use replace instead of push to prevent back button issues
        router.replace('/chat');
      }
    };

    handleNavigation();
  }, [user, pathname, router]);

  // Only render children if we have a user or we're on an auth page
  if (!user && !pathname.startsWith('/auth')) {
    return null;
  }

  return <>{children}</>;
}