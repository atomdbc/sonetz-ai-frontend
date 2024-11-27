// src/app/share/[threadId]/page.tsx
'use client';

import { ChatProvider } from '@/lib/chat/ChatContext';
import { SharePageContent } from '@/components/chat/SharePageContent';



export default function SharePage({ 
    params 
  }: { 
    params: { threadId: string } 
  }) {
    return (
      <ChatProvider>
        <SharePageContent threadId={params.threadId} />
      </ChatProvider>
    );
  }