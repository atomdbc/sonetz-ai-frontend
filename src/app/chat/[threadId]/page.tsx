'use client';

import { useParams } from 'next/navigation';
import { ChatArea } from '@/components/chat/ChatArea';
import { ThreadsList } from '@/components/chat/ThreadsList';
import { useChat } from '@/lib/chat/ChatContext';

export default function ThreadPage() {
  const params = useParams();
  const { createThread } = useChat();

  return (
    <div className="flex h-screen">
      <aside className="w-64 border-r bg-muted/30">
        <ThreadsList onNewChat={createThread} />
      </aside>
      <main className="flex-1">
        <ChatArea threadId={params.threadId as string} />
      </main>
    </div>
  );
}