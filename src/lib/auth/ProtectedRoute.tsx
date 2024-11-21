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
    if (!user && !pathname.startsWith('/auth')) {
      router.push('/auth/signin');
    }

    if (user && pathname.startsWith('/auth')) {
      router.push('/chat');
    }
  }, [user, pathname, router]);

  return <>{children}</>;
}