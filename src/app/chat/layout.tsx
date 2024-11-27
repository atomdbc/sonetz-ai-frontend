// src/app/chat/layout.tsx
'use client';

import { ChatProvider } from '@/lib/chat/ChatContext';
import { useAuth } from '@/lib/auth/authContext';
import { redirect } from 'next/navigation';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, user } = useAuth();

  // Handle authentication
  if (!token || !user) {
    redirect('/auth/signin');
  }

  return (
    <ChatProvider>
      <div className="relative h-[100dvh] overflow-hidden">
        {children}
      </div>
    </ChatProvider>
  );
}