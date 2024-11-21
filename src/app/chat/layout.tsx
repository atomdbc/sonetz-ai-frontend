'use client';

// app/chat/layout.tsx
import { ChatProvider } from '@/lib/chat/ChatContext';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChatProvider>
      <div className="relative h-[100dvh] overflow-hidden">
        {children}
      </div>
    </ChatProvider>
  );
}