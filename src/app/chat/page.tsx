'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useChat } from '@/lib/chat/ChatContext';
import { ThreadsList } from '@/components/chat/ThreadsList';
import { WelcomeScreen } from '@/components/chat/WelcomeScreen';

export default function ChatPage() {
  const { threads, fetchThreads, createThread } = useChat();
  const router = useRouter();

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  const handleNewChat = async () => {
    const thread = await createThread();
    router.push(`/chat/${thread.id}`);
  };

  return (
    <div className="flex h-screen">
      <aside className="w-64 border-r bg-muted/30">
        <ThreadsList threads={threads} onNewChat={handleNewChat} />
      </aside>
      <main className="flex-1">
        <WelcomeScreen onNewChat={handleNewChat} />
      </main>
    </div>
  );
}
