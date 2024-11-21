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

function cleanMessageContent(content: string): string {
  try {
    // Extract only the Final Answer content as that's what backend sends
    const finalAnswerMatch = content.match(/Final Answer:(.*?)(?=$)/s);
    if (finalAnswerMatch) {
      return finalAnswerMatch[1].trim();
    }
    return content.trim();
  } catch (e) {
    return content;
  }
}

export function ChatArea({ threadId }: ChatAreaProps) {
  const {
    currentThread,
    fetchThread,
    sendMessage,
    loading,
    isConnected
  } = useChat();

  const [processedMessages, setProcessedMessages] = useState<Message[]>([]);
  const [showTyping, setShowTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastProcessedMessageId = useRef<string | null>(null);
  const lastStreamingState = useRef<boolean | null>(null);
  const sendTimeoutRef = useRef<NodeJS.Timeout>();
  const isInitialMount = useRef(true);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  }, []);

  // Handle message sending
  const handleSendMessage = useCallback(async (content: string) => {
    try {
      if (sendTimeoutRef.current) {
        clearTimeout(sendTimeoutRef.current);
      }
      setShowTyping(true);
      await sendMessage(content);
    } catch (error) {
      setShowTyping(false);
      throw error;
    }
  }, [sendMessage]);

  // Process messages when they update
  useEffect(() => {
    if (!currentThread?.messages?.length) {
      if (!isInitialMount.current) {
        setProcessedMessages([]);
        lastProcessedMessageId.current = null;
        lastStreamingState.current = null;
      }
      return;
    }

    isInitialMount.current = false;
    const lastMessage = currentThread.messages[currentThread.messages.length - 1];
    const hasNewMessage = lastMessage?.id !== lastProcessedMessageId.current;
    const streamingStateChanged = lastMessage?.isStreaming !== lastStreamingState.current;

    if (hasNewMessage || streamingStateChanged) {
      const processed = currentThread.messages.map(msg => ({
        ...msg,
        content: msg.isStreaming ? msg.content : cleanMessageContent(msg.content)
      }));

      setProcessedMessages(processed);
      
      if (!lastMessage.isStreaming) {
        lastProcessedMessageId.current = lastMessage.id;
      }
      lastStreamingState.current = lastMessage.isStreaming;

      scrollToBottom();
    }
  }, [currentThread?.messages, scrollToBottom]);

  // Handle typing indicator based on message state and completion
  useEffect(() => {
    const lastMessage = currentThread?.messages?.[currentThread.messages.length - 1];
    
    // Determine if we should show typing indicator
    const shouldShowTyping = () => {
      // Show when loading
      if (loading) return true;
      
      // Show if there's a streaming message
      if (lastMessage?.isStreaming) return true;
      
      // Don't show if we have a completed agent message
      if (lastMessage?.role === 'agent' && !lastMessage.isStreaming) return false;
      
      return false;
    };

    if (shouldShowTyping()) {
      setShowTyping(true);
      if (sendTimeoutRef.current) {
        clearTimeout(sendTimeoutRef.current);
        sendTimeoutRef.current = undefined;
      }
    } else {
      // Hide typing indicator with minimal delay
      if (!sendTimeoutRef.current) {
        sendTimeoutRef.current = setTimeout(() => {
          setShowTyping(false);
          sendTimeoutRef.current = undefined;
        }, 200);
      }
    }

    return () => {
      if (sendTimeoutRef.current) {
        clearTimeout(sendTimeoutRef.current);
      }
    };
  }, [loading, currentThread?.messages]);

  // Initial thread fetch and cleanup
  useEffect(() => {
    if (threadId) {
      fetchThread(threadId);
    }
    
    return () => {
      setProcessedMessages([]);
      lastProcessedMessageId.current = null;
      lastStreamingState.current = null;
      setShowTyping(false);
      isInitialMount.current = true;
      if (sendTimeoutRef.current) {
        clearTimeout(sendTimeoutRef.current);
      }
    };
  }, [threadId, fetchThread]);

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
          <AlertDescription>
            Connecting to chat server...
          </AlertDescription>
        </Alert>
      )}
  
      <div className="flex-1 overflow-hidden">
        <MessageList
          messages={processedMessages}
          isLoading={showTyping}
        />
        <div ref={messagesEndRef} />
      </div>
  
      <div className="border-t p-4">
        <ChatInput
          onSend={handleSendMessage}
          isLoading={showTyping}  // Changed from disabled prop
          disabled={!isConnected} // Only disable when not connected
          placeholder={
            !isConnected
              ? "Connecting to chat..."
              : "Type your message..."
          }
        />
      </div>
    </div>
  );
}