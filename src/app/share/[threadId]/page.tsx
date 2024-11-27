// src/app/share/[threadId]/page.tsx
'use client';

import { ChatProvider } from '@/lib/chat/ChatContext';
import { SharePageContent } from '@/components/chat/SharePageContent';

interface SharePageProps {
  params: {
    threadId: string;
  };
}

export default function SharePage({ params }: SharePageProps) {
  return (
    <ChatProvider>
      <SharePageContent threadId={params.threadId} />
    </ChatProvider>
  );
}