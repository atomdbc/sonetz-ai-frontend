// src/components/chat/ChatArea.tsx

'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useChat } from '@/lib/chat/ChatContext';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import ThreadHeader from './ThreadHeader';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { Message } from '@/types/message';

interface ChatAreaProps {
  threadId: string;
}

function getCleanContent(content: string): string {
  let cleanedContent = content;

  try {
    // Check if content is a JSON string
    if (typeof content === 'string' && content.trim().startsWith('{')) {
      const parsed = JSON.parse(content);

      // Check if parsed object has a 'content' field
      if (parsed && typeof parsed.content === 'string') {
        cleanedContent = parsed.content;
      } else if (parsed && typeof parsed.message === 'string') {
        cleanedContent = parsed.message;
      } else {
        // If 'content' or 'message' field doesn't exist, use the entire parsed object as a string
        cleanedContent = JSON.stringify(parsed);
      }
    }

    // Clean up the content (optional, based on your needs)
    cleanedContent = cleanedContent.replace(/^\s*[-•]\s*/gm, '• ').trim();

    return cleanedContent;
  } catch (e) {
    console.error('Error parsing message content:', e);
    // If parsing fails, return the original content
    return content.trim();
  }
}

export function ChatArea({ threadId }: ChatAreaProps) {
  const { currentThread, fetchThread, sendMessage, isConnected } = useChat();

  const [processedMessages, setProcessedMessages] = useState<Message[]>([]);
  const [showThinking, setShowThinking] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastProcessedMessageId = useRef<string | null>(null);
  const lastStreamingState = useRef<boolean | null>(null);
  const isInitialMount = useRef(true);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  }, []);

  // Handle message sending
  const handleSendMessage = useCallback(
    async (content: string) => {
      try {
        setShowThinking(true); // Start showing "Aira is thinking..." when user sends a message
        await sendMessage(content);
      } catch (error) {
        setShowThinking(false);
        throw error;
      }
    },
    [sendMessage]
  );

  // Process messages when they update
  useEffect(() => {
    console.log('Current thread:', currentThread);

    if (currentThread && currentThread.messages && currentThread.messages.length > 0) {
      isInitialMount.current = false;

      const lastMessage = currentThread.messages[currentThread.messages.length - 1];
      const hasNewMessage = lastMessage?.id !== lastProcessedMessageId.current;
      const streamingStateChanged = lastMessage?.isStreaming !== lastStreamingState.current;

      if (hasNewMessage || streamingStateChanged) {
        // Sort messages by created_at timestamp
        const sortedMessages = [...currentThread.messages].sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        const processed = sortedMessages.map((msg) => ({
          ...msg,
          content: getCleanContent(msg.content),
        }));

        console.log('Processed messages:', processed);

        setProcessedMessages(processed);

        if (lastMessage.isStreaming) {
          setShowThinking(false); // Stop showing "Aira is thinking..." when streaming starts
        }

        if (!lastMessage.isStreaming) {
          lastProcessedMessageId.current = lastMessage.id;
        }
        lastStreamingState.current = lastMessage.isStreaming;

        scrollToBottom();
      }
    } else {
      console.log('No messages found in currentThread');
      if (!isInitialMount.current) {
        setProcessedMessages([]);
        lastProcessedMessageId.current = null;
        lastStreamingState.current = null;
      }
    }
  }, [currentThread, scrollToBottom]);

  // Initial thread fetch and cleanup
  useEffect(() => {
    console.log('Fetching thread with ID:', threadId);
    if (threadId) {
      fetchThread(threadId)
        .then(() => {
          console.log('Thread fetched successfully.');
        })
        .catch((err) => {
          console.error('Error fetching thread:', err);
          setError(err);
        });
    }

    return () => {
      setProcessedMessages([]);
      lastProcessedMessageId.current = null;
      lastStreamingState.current = null;
      setShowThinking(false);
      isInitialMount.current = true;
    };
  }, [threadId, fetchThread]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">Error loading messages: {error.message}</p>
      </div>
    );
  }

  if (!currentThread) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <ThreadHeader thread={currentThread} />

      {!isConnected && (
        <Alert className="mx-4 mt-2">
          <AlertDescription>Connecting to chat server...</AlertDescription>
        </Alert>
      )}

      <div className="flex-1 overflow-hidden">
        <MessageList
          messages={processedMessages}
          showThinking={showThinking}
          threadOwnerId={currentThread.user_id}
          currentUserId={currentThread.current_user_id}
        />
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4">
        <ChatInput
          onSend={handleSendMessage}
          isLoading={showThinking}
          disabled={!isConnected}
          placeholder={!isConnected ? 'Connecting to chat...' : 'Type your message...'}
        />
      </div>
    </div>
  );
}
