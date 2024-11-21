'use client';

import { useRef, useEffect, useCallback } from 'react';
import { Message } from '@/types/message';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface MessageGroupProps {
  message: Message;
  isLastInGroup: boolean;
}

function MessageGroup({ message, isLastInGroup }: MessageGroupProps) {
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 640px)");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getCleanContent(message));
      toast({ description: "Message copied" });
    } catch (error) {
      toast({ 
        description: "Failed to copy message",
        variant: "destructive" 
      });
    }
  };

  const handleFeedback = (type: 'up' | 'down') => {
    toast({ 
      description: "Feedback recorded - Thanks!",
      duration: 1500
    });
  };

  const getCleanContent = (message: Message): string => {
    try {
      if (message.content.startsWith('{') && message.content.includes('"content"')) {
        const parsed = JSON.parse(message.content);
        return parsed.content || '';
      }

      const content = message.content
        .replace(/^Thought:.*$/gm, '')
        .replace(/^Action:.*$/gm, '')
        .replace(/^Action Input:.*$/gm, '')
        .replace(/^Final Answer:\s*/gm, '')
        .replace(/^\s*\{[^}]+\}\s*$/gm, '')
        .replace(/\*\*/g, '')
        .replace(/\n\s*\n/g, '\n')
        .replace(/^\s*[-•]\s*/gm, '• ')
        .trim();

      return content;
    } catch (e) {
      return message.content.trim();
    }
  };

  const formatTimestamp = (date: string) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return `Today at ${messageDate.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${messageDate.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else {
      return messageDate.toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const cleanContent = getCleanContent(message);
  if (!cleanContent || cleanContent.startsWith('Thought:')) {
    return null;
  }

  return (
    <div className={cn(
      "flex gap-2 sm:gap-3 px-2 sm:px-4",
      message.role === 'user' ? 'justify-end' : 'justify-start'
    )}>
      {message.role === 'agent' && (
        <Avatar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
          <img src="/aira_avatar.webp" alt="AI" className="rounded-full" />
        </Avatar>
      )}

      <div className={cn(
        "group flex flex-col relative",
        message.role === 'user' ? 'items-end' : 'items-start',
        isMobile ? 'max-w-[85%]' : 'max-w-[70%]'
      )}>
        {message.role === 'user' ? (
          <Card className="px-3 py-2 bg-white border hover:bg-gray-50">
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {cleanContent}
            </p>
          </Card>
        ) : (
          <div className="px-3 py-2">
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {cleanContent}
            </p>
          </div>
        )}

        <div className="flex items-center gap-1 mt-1">
          <span className="text-[11px] text-muted-foreground px-1">
            {formatTimestamp(message.created_at)}
          </span>

          {message.role === 'agent' && (
            <div className={cn(
              "flex items-center gap-0.5 bg-white/80 rounded-md",
              isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100 transition-opacity"
            )}>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={handleCopy}
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => handleFeedback('up')}
              >
                <ThumbsUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => handleFeedback('down')}
              >
                <ThumbsDown className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {message.role === 'user' && (
        <Avatar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
          <img src="/user_avatar.webp" alt="User" className="rounded-full" />
        </Avatar>
      )}
    </div>
  );
}

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const isAtBottom = useRef(true);

  // Determine if we should show the typing indicator
  const shouldShowTyping = useCallback(() => {
    if (!isLoading) return false;
    
    const lastMessage = messages[messages.length - 1];
    // Don't show typing if last message is from agent and not streaming
    if (lastMessage?.role === 'agent' && !lastMessage.isStreaming) {
      return false;
    }
    
    return true;
  }, [messages, isLoading]);

  // Handle scroll behavior
  useEffect(() => {
    if (isAtBottom.current || isLoading) {
      requestAnimationFrame(() => {
        lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }, [messages.length, isLoading]);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      isAtBottom.current = scrollTop + clientHeight >= scrollHeight - 100;
    }
  }, []);

  return (
    <ScrollArea 
      ref={scrollRef} 
      className="h-[calc(100vh-8rem)] sm:h-[calc(100vh-9rem)]"
      onScroll={handleScroll}
    >
      <div className="space-y-4 sm:space-y-6 py-4">
        {messages.map((message, i) => (
          <MessageGroup
            key={message.id}
            message={message}
            isLastInGroup={
              i === messages.length - 1 ||
              messages[i + 1].role !== message.role
            }
          />
        ))}

        {shouldShowTyping() && (
          <div 
            ref={lastMessageRef}
            className="flex items-center gap-2 text-xs text-muted-foreground px-4 sm:pl-11"
          >
            <Avatar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
              <img src="/aira_avatar.webp" alt="AI" className="rounded-full" />
            </Avatar>
            <div className="animate-pulse">Aira is thinking...</div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}