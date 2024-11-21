'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Message } from '@/types/message';
import { useToast } from '@/hooks/use-toast';

interface StreamMessage {
  type: 'stream' | 'complete';
  content: string;
  id?: string;
  created_at?: string;
}

interface WebSocketHookProps {
  threadId: string;
  userId: string;
  token: string;
}

export function useWebSocket({
  threadId,
  userId,
  token
}: WebSocketHookProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const connectAttempts = useRef(0);
  const { toast } = useToast();
  const maxRetries = 3;
  const connectTimeoutRef = useRef<NodeJS.Timeout>();
  const lastMessageIdRef = useRef<string | null>(null);

  const handleMessage = useCallback((data: StreamMessage) => {
    setMessages(prev => {
      const newMessages = [...prev];
      
      switch (data.type) {
        case 'stream': {
          // Ignore empty or whitespace-only content
          if (!data.content.trim()) {
            return newMessages;
          }

          // If there's a streaming message, update it
          if (newMessages.length && newMessages[newMessages.length - 1].isStreaming) {
            const lastMessage = newMessages[newMessages.length - 1];
            lastMessage.content = data.content;
            return [...newMessages];
          }

          // Create new streaming message if none exists
          const streamingMessage: Message = {
            id: `stream-${Date.now()}`,
            thread_id: threadId,
            content: data.content,
            role: 'agent',
            type: 'text',
            created_at: new Date().toISOString(),
            isStreaming: true
          };

          // Store the streaming message ID for later comparison
          lastMessageIdRef.current = streamingMessage.id;
          
          return [...newMessages, streamingMessage];
        }
        
        case 'complete': {
          // Remove any existing streaming message
          const messagesWithoutStreaming = newMessages.filter(msg => !msg.isStreaming);
          
          // Create the complete message
          const completeMessage: Message = {
            id: data.id || `msg-${Date.now()}`,
            thread_id: threadId,
            content: data.content,
            role: 'agent',
            type: 'text',
            created_at: data.created_at || new Date().toISOString(),
            isStreaming: false
          };

          // Only add if content is not empty
          if (completeMessage.content.trim()) {
            return [...messagesWithoutStreaming, completeMessage];
          }
          
          return messagesWithoutStreaming;
        }
        
        default:
          return newMessages;
      }
    });
    
    setIsLoading(data.type === 'stream');
  }, [threadId]);

  const connect = useCallback(() => {
    if (!threadId || !userId || !token) return;
    if (connectAttempts.current >= maxRetries) return;
    
    try {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      const baseUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';
      const wsUrl = `${baseUrl}/ws/chat/${threadId}?token=${encodeURIComponent(token)}&user_id=${encodeURIComponent(userId)}`;
      console.log('Connecting to:', wsUrl);

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        connectAttempts.current = 0;
        lastMessageIdRef.current = null;  // Reset on new connection
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received:', data);
          if (data.content || data.type === 'complete') {  // Only process if there's content or it's a completion
            handleMessage(data);
          }
        } catch (error) {
          console.error('Failed to parse message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        setIsLoading(false);  // Reset loading state on disconnect
        
        if (event.code !== 1000 && event.code !== 4003) {
          connectAttempts.current += 1;
          if (connectAttempts.current < maxRetries) {
            const delay = Math.min(1000 * Math.pow(2, connectAttempts.current), 10000);
            console.log(`Reconnecting in ${delay}ms... (Attempt ${connectAttempts.current}/${maxRetries})`);
            connectTimeoutRef.current = setTimeout(connect, delay);
          }
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setIsLoading(false);
    }
  }, [threadId, userId, token, handleMessage]);

  const sendMessage = useCallback((content: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      toast({ description: "Not connected to chat", variant: "destructive" });
      return false;
    }

    try {
      // Reset streaming state
      lastMessageIdRef.current = null;
      
      // Add user message immediately
      setMessages(prev => [...prev, {
        id: `user-${Date.now()}`,
        thread_id: threadId,
        content,
        role: 'user',
        type: 'text',
        created_at: new Date().toISOString()
      }]);

      wsRef.current.send(JSON.stringify({
        content,
        type: 'text',
        thread_id: threadId,
        user_id: userId
      }));
      
      setIsLoading(true);  // Set loading state when sending message
      return true;
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsLoading(false);
      return false;
    }
  }, [threadId, userId, toast]);

  useEffect(() => {
    connect();
    return () => {
      if (connectTimeoutRef.current) {
        clearTimeout(connectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close(1000);
        wsRef.current = null;
      }
      setIsLoading(false);  // Reset loading state on cleanup
    };
  }, [connect]);

  return { messages, isConnected, isLoading, sendMessage };
}