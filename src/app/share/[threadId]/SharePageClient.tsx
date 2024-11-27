// src/app/share/[threadId]/SharePageClient.tsx
'use client';

import { ChatProvider } from '@/lib/chat/ChatContext';
import { SharePageContent } from '@/components/chat/SharePageContent';

interface SharePageClientProps {
  threadId: string;
}

export default function SharePageClient({ threadId }: SharePageClientProps) {
  return (
    <ChatProvider>
      <SharePageContent threadId={threadId} />
    </ChatProvider>
  );
}