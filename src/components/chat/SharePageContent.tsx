// src/components/chat/SharePageContent.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useChat } from '@/lib/chat/ChatContext';
import { useAuth } from '@/lib/auth/authContext';
import { useToast } from '@/hooks/use-toast';

export function SharePageContent({ threadId }: { threadId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { getThreadAccess } = useChat();
  const { token } = useAuth();

  useEffect(() => {
    const handleAccess = async () => {
      try {
        if (!token) {
          const url = new URL('/auth/signin', window.location.origin);
          url.searchParams.set('callbackUrl', `/share/${threadId}`);
          const shareId = searchParams?.get('share_id');
          if (shareId) {
            url.searchParams.set('share_id', shareId);
          }
          router.push(url.toString());
          return;
        }

        const shareId = searchParams?.get('share_id');
        await getThreadAccess(threadId, shareId);
        router.push(`/chat/${threadId}`);
      } catch (error) {
        console.error('Error accessing shared thread:', error);
        toast({
          title: 'Error',
          description: 'Could not access shared thread',
          variant: 'destructive',
        });
        router.push('/chat');
      }
    };

    handleAccess();
  }, [threadId, router, getThreadAccess, toast, token, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Accessing shared thread...</h2>
        <p className="text-muted-foreground">Please wait while we set up your access.</p>
      </div>
    </div>
  );
}