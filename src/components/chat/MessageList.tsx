// src/components/chat/MessageList.tsx

'use client';

import { useRef, useEffect, useCallback } from 'react';
import { Message } from '@/types/message';
import { ScrollArea } from '@/components/ui/scroll-area';
import MessageGroup from './MessageGroup';

interface MessageListProps {
  messages: Message[];
  showThinking?: boolean;
  threadOwnerId: string;
  currentUserId: string;
}

export default function MessageList({
  messages,
  showThinking,
  threadOwnerId,
  currentUserId,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const isAtBottom = useRef(true);
  const previousMessagesLength = useRef(messages.length);

  // Scroll handling
  useEffect(() => {
    // If new messages were added
    if (messages.length > previousMessagesLength.current) {
      // Only scroll if we're at the bottom or if it's a new message (not loading history)
      if (
        isAtBottom.current ||
        messages.length - previousMessagesLength.current <= 1
      ) {
        requestAnimationFrame(() => {
          lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
        });
      }
    }
    previousMessagesLength.current = messages.length;
  }, [messages.length]);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      isAtBottom.current = scrollTop + clientHeight >= scrollHeight - 100;
    }
  }, []);

  if (!messages || messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No messages yet
      </div>
    );
  }

  return (
    <ScrollArea
      ref={scrollRef}
      className="h-[calc(100vh-8rem)] sm:h-[calc(100vh-9rem)]"
      onScroll={handleScroll}
    >
      <div className="space-y-4 sm:space-y-6 py-4">
        {messages.map((message, i) => (
          <MessageGroup
            key={message.id || `temp-${i}`}
            message={message}
            isLastInGroup={
              i === messages.length - 1 ||
              messages[i + 1]?.role !== message.role
            }
            isOwner={message.message_metadata?.user_id === threadOwnerId}
            currentUserId={currentUserId}
            threadOwnerId={threadOwnerId}
          />
        ))}

        {/* Thinking indicator */}
        {showThinking && (
          <div
            ref={lastMessageRef}
            className="flex items-center gap-2 text-xs text-muted-foreground px-4 sm:pl-11"
          >
            <div className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0 relative rounded-full overflow-hidden">
              <img
                src="/aira_avatar.jpg"
                alt="AI"
                width={32}
                height={32}
                className="rounded-full"
              />
            </div>
            <div className="animate-pulse">Aira is thinking...</div>
          </div>
        )}
      </div>

      {/* Scroll anchor */}
      <div ref={lastMessageRef} />
    </ScrollArea>
  );
}
