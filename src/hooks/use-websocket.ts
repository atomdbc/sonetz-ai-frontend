// src/hooks/useWebSocket.tsx

'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Message } from '@/types/message';
import { useToast } from '@/hooks/use-toast';

interface StreamMessage {
  type: 'stream' | 'complete' | 'user_joined' | 'user_left' | 'error' | 'connection_state' | 'message';
  content?: string;
  id?: string;
  created_at?: string;
  user_id?: string;
  timestamp?: string;
  role?: string;
  thread_id?: string;
}

interface ThreadParticipant {
  user_id: string;
  role: 'owner' | 'contributor' | 'viewer';
  last_active?: string;
}

interface WebSocketHookProps {
  threadId: string;
  userId: string;
  token: string;
  onParticipantUpdate?: (participants: ThreadParticipant[]) => void;
}

export function useWebSocket({
  threadId,
  userId,
  token,
  onParticipantUpdate
}: WebSocketHookProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [participants, setParticipants] = useState<ThreadParticipant[]>([]);
  const [userRole, setUserRole] = useState<'owner' | 'contributor' | 'viewer'>('viewer');
  const wsRef = useRef<WebSocket | null>(null);
  const connectAttempts = useRef(0);
  const { toast } = useToast();
  const maxRetries = 3;
  const connectTimeoutRef = useRef<NodeJS.Timeout>();
  const lastMessageIdRef = useRef<string | null>(null);

  const handleMessage = useCallback((data: StreamMessage) => {
    console.log('Received WebSocket message:', data);
    
    switch (data.type) {
      case 'connection_state': {
        if (data.role) {
          console.log('Setting user role from connection state:', data.role);
          setUserRole(data.role as 'owner' | 'contributor' | 'viewer');
          // Update participant list with our own role
          setParticipants(prev => {
            const filtered = prev.filter(p => p.user_id !== userId);
            return [...filtered, { user_id: userId, role: data.role as 'owner' | 'contributor' | 'viewer' }];
          });
        }
        break;
      }

      case 'user_joined': {
        if (data.user_id) {
          console.log('User joined:', data.user_id, 'with role:', data.role);
          toast({
            description: `A participant has joined the thread`,
            variant: "default"
          });
          
          setParticipants(prev => {
            // Remove if exists and add with new role
            const filtered = prev.filter(p => p.user_id !== data.user_id);
            return [...filtered, {
              user_id: data.user_id!,
              role: (data.role as 'owner' | 'contributor' | 'viewer') || 'viewer'
            }];
          });
        }
        break;
      }

      case 'user_left': {
        if (data.user_id) {
          console.log('User left:', data.user_id);
          toast({
            description: `A participant has left the thread`,
            variant: "default"
          });
          setParticipants(prev => prev.filter(p => p.user_id !== data.user_id));
        }
        break;
      }

      case 'error': {
        console.error('WebSocket error:', data.content);
        toast({
          description: data.content || "An error occurred",
          variant: "destructive"
        });
        break;
      }

      // New case to handle user messages
      case 'message': {
        setMessages(prev => {
          // Don't add if it's our own message (we already added it in sendMessage)
          if (data.user_id === userId) {
            return prev;
          }

          const newMessage: Message = {
            id: `msg-${Date.now()}`,
            thread_id: threadId,
            content: data.content || '',
            role: data.role as 'user' | 'agent' | 'system',
            type: 'text',
            created_at: data.timestamp || new Date().toISOString(),
            isStreaming: false,
            message_metadata: {
              user_id: data.user_id
            }
          };

          return [...prev, newMessage];
        });
        break;
      }

      case 'stream': {
        setIsLoading(false);
        setMessages(prev => {
          const newMessages = [...prev];

          if (!data.content?.trim()) return newMessages;

          if (newMessages.length && newMessages[newMessages.length - 1].isStreaming) {
            // Create a new message object to avoid mutating state
            const updatedMessage = {
              ...newMessages[newMessages.length - 1],
              content: data.content
            };
            newMessages[newMessages.length - 1] = updatedMessage;
            return newMessages;
          }

          const streamingMessage: Message = {
            id: `stream-${Date.now()}`,
            thread_id: threadId,
            content: data.content,
            role: 'agent',
            type: 'text',
            created_at: new Date().toISOString(),
            isStreaming: true
          };

          return [...newMessages, streamingMessage];
        });

        setIsLoading(false); // AI has started streaming, stop showing "Aira is thinking"
        break;
      }

      case 'complete': {
        setIsLoading(false); 
        setMessages(prev => {
          const messagesWithoutStreaming = prev.filter(msg => !msg.isStreaming);

          if (!data.content?.trim()) return messagesWithoutStreaming;

          const completeMessage: Message = {
            id: data.id || `msg-${Date.now()}`,
            thread_id: threadId,
            content: data.content,
            role: 'agent',
            type: 'text',
            created_at: data.created_at || new Date().toISOString(),
            isStreaming: false
          };

          return [...messagesWithoutStreaming, completeMessage];
        });

        setIsLoading(false); // Ensure isLoading is false after completion
        break;
      }
    }
  }, [threadId, userId, toast]);


  const connect = useCallback(() => {
    if (!threadId || !userId || !token) return;
    if (connectAttempts.current >= maxRetries) return;
    
    try {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      const baseUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';
      const wsUrl = `${baseUrl}/agent/ws/chat/${threadId}?token=${encodeURIComponent(token)}&user_id=${encodeURIComponent(userId)}`;
      
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        connectAttempts.current = 0;
        lastMessageIdRef.current = null;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received:', data);
          handleMessage(data);
        } catch (error) {
          console.error('Failed to parse message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        setIsLoading(false);
        
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
      console.error('WebSocket not connected, readyState:', wsRef.current?.readyState);
      toast({ description: "Not connected to chat", variant: "destructive" });
      return false;
    }

    // Check if user has permission to send messages
    if (userRole === 'viewer') {
      toast({ description: "You don't have permission to send messages", variant: "destructive" });
      return false;
    }

    try {
      setMessages(prev => [...prev, {
        id: `user-${Date.now()}`,
        thread_id: threadId,
        content,
        role: 'user',
        type: 'text',
        created_at: new Date().toISOString(),
        message_metadata: {
          user_id: userId,
          user_role: userRole
        }
      }]);

      wsRef.current.send(JSON.stringify({
        content,
        type: 'text',
        thread_id: threadId,
        user_id: userId
      }));

      setIsLoading(true); // Set isLoading to true when message is sent
      return true;
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsLoading(false);
      return false;
    }
  }, [threadId, userId, toast, userRole]);

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
      setIsLoading(false);
    };
  }, [connect]);

  return { 
    messages, 
    isConnected, 
    isLoading, 
    sendMessage, 
    participants,
    userRole 
  };
}
