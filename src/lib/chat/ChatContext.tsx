'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Thread, ThreadShare, ThreadUpdate, ThreadParticipant } from '@/types/thread';
import { Message } from '@/types/message';
import { chatService } from '@/services/chatService';
import { useAuth } from '@/lib/auth/authContext';
import { useToast } from '@/hooks/use-toast';
import { useWebSocket } from '@/hooks/use-websocket';

interface ChatContextType {
  threads: Thread[];
  currentThread: Thread | null;
  loading: boolean;
  error: Error | null;
  isConnected: boolean;
  participants: ThreadParticipant[];
  userRole: 'owner' | 'contributor' | 'viewer';
  fetchThreads: (params?: { status?: string; limit?: number; offset?: number }) => Promise<void>;
  fetchThread: (threadId: string) => Promise<void>;
  createThread: (title?: string) => Promise<Thread>;
  sendMessage: (content: string) => Promise<void>;
  updateThread: (threadId: string, updates: ThreadUpdate) => Promise<void>;
  deleteThread: (threadId: string) => Promise<void>;
  shareThread: (threadId: string, shareData: ThreadShare) => Promise<void>;
  acceptThreadInvite: (threadId: string, shareId: string) => Promise<void>;
  getThreadAccess: (threadId: string, shareId?: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | null>(null);

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const { user, token } = useAuth();
  const { toast } = useToast();
  
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentThread, setCurrentThread] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [participants, setParticipants] = useState<ThreadParticipant[]>([]);
  const [userRole, setUserRole] = useState<'owner' | 'contributor' | 'viewer'>('viewer');

  // WebSocket Integration with participant handling
  const { 
    messages: wsMessages, 
    isConnected, 
    isLoading: wsLoading, 
    sendMessage: sendWebSocketMessage,
    participants: wsParticipants,
    userRole: wsUserRole 
  } = useWebSocket({
    threadId: currentThread?.id || '',
    userId: user?.id || '',
    token: token || '',
    onParticipantUpdate: (newParticipants) => {
      setParticipants(newParticipants);
    }
  });

  // Update current thread when websocket messages change
  useEffect(() => {
    if (!currentThread?.id) return;
    
    setCurrentThread(prev => {
      if (!prev) return null;
      return {
        ...prev,
        messages: wsMessages,
        messageCount: wsMessages.filter(m => !m.isStreaming).length,
        lastMessageAt: wsMessages[wsMessages.length - 1]?.created_at || prev.lastMessageAt
      };
    });
  }, [wsMessages, currentThread?.id]);

  // Update role and participants when they change
  useEffect(() => {
    if (wsUserRole) {
      setUserRole(wsUserRole);
    }
  }, [wsUserRole]);

  useEffect(() => {
    if (wsParticipants.length) {
      setParticipants(wsParticipants);
    }
  }, [wsParticipants]);

  const handleError = useCallback((error: unknown, message: string) => {
    console.error(message, error);
    const errorObject = error instanceof Error ? error : new Error(String(error));
    setError(errorObject);
    toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
    });
  }, [toast]);

  const fetchThreads = useCallback(async (params?: { status?: string; limit?: number; offset?: number }) => {
    if (!user?.id || !token) return;
    
    setLoading(true);
    try {
      const data = await chatService.getThreads(params);
      setThreads(data);
      setError(null);
    } catch (err) {
      handleError(err, 'Failed to fetch threads');
    } finally {
      setLoading(false);
    }
  }, [user?.id, token, handleError]);

  const fetchThread = useCallback(async (threadId: string) => {
    if (!user?.id || !token) return;
    
    setLoading(true);
    try {
      const data = await chatService.getThread(threadId);
      setCurrentThread(data);
      setError(null);
    } catch (err) {
      handleError(err, 'Failed to fetch thread');
    } finally {
      setLoading(false);
    }
  }, [user?.id, token, handleError]);

  const createThread = useCallback(async (title?: string) => {
    if (!user?.id || !token) {
      throw new Error('Authentication required');
    }
    
    setLoading(true);
    try {
      const thread = await chatService.createThread(title);
      setThreads(prev => [thread, ...prev]);
      return thread;
    } catch (err) {
      handleError(err, 'Failed to create thread');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id, token, handleError]);

  const sendMessage = useCallback(async (content: string) => {
    if (!currentThread?.id || !user?.id || !token || !isConnected) {
      toast({
        title: 'Error',
        description: !token ? 'Please sign in again' : 
                   !isConnected ? 'Chat disconnected. Please wait...' : 
                   'Unable to send message',
        variant: 'destructive',
      });
      return;
    }

    // Check if user has permission to send messages
    if (userRole === 'viewer') {
      toast({
        title: 'Error',
        description: "You don't have permission to send messages",
        variant: 'destructive',
      });
      return;
    }

    try {
      const success = await sendWebSocketMessage(content);
      
      if (!success) {
        toast({
          title: 'Error',
          description: 'Failed to send message. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      handleError(err, 'Failed to send message');
    }
  }, [currentThread?.id, user?.id, token, isConnected, userRole, sendWebSocketMessage, handleError, toast]);

  const updateThread = useCallback(async (threadId: string, updates: ThreadUpdate) => {
    if (!user?.id || !token) {
      throw new Error('Authentication required');
    }
    
    setLoading(true);
    try {
      const updatedThread = await chatService.updateThread(threadId, updates);
      setThreads(prev => prev.map(thread => 
        thread.id === threadId ? { ...thread, ...updatedThread } : thread
      ));
      if (currentThread?.id === threadId) {
        setCurrentThread(prev => prev ? { ...prev, ...updatedThread } : null);
      }
      toast({
        description: 'Thread updated successfully',
      });
    } catch (err) {
      handleError(err, 'Failed to update thread');
    } finally {
      setLoading(false);
    }
  }, [user?.id, token, handleError, currentThread?.id, toast]);

  const deleteThread = useCallback(async (threadId: string) => {
    if (!user?.id || !token) {
      throw new Error('Authentication required');
    }
    
    try {
      await chatService.deleteThread(threadId);
      setThreads(prev => prev.filter(thread => thread.id !== threadId));
      if (currentThread?.id === threadId) {
        setCurrentThread(null);
      }
      toast({
        description: 'Thread deleted successfully',
      });
    } catch (err) {
      handleError(err, 'Failed to delete thread');
    }
  }, [user?.id, token, handleError, currentThread?.id, toast]);

  const shareThread = useCallback(async (threadId: string, shareData: ThreadShare) => {
    if (!user?.id || !token) {
      throw new Error('Authentication required');
    }
    
    try {
      const result = await chatService.shareThread(threadId, shareData);
      
      // Update participants list if available
      if (result.participant) {
        setParticipants(prev => [...prev, result.participant]);
      }

      toast({
        description: result.message || 'Thread shared successfully',
      });

      return result;
    } catch (err) {
      handleError(err, 'Failed to share thread');
      throw err;
    }
  }, [user?.id, token, handleError, toast]);

  const getThreadAccess = useCallback(async (threadId: string, shareId?: string) => {
    if (!user?.id || !token) return;
    
    try {
      const data = await chatService.getThreadAccess(threadId, shareId);
      setCurrentThread(data);
      setError(null);
    } catch (err) {
      handleError(err, 'Failed to access thread');
    }
  }, [user?.id, token, handleError]);

  const acceptThreadInvite = useCallback(async (threadId: string, shareId: string) => {
    if (!user?.id || !token) {
      throw new Error('Authentication required');
    }
    
    try {
      const result = await chatService.acceptThreadInvite(threadId, shareId);
      toast({
        description: result.message || 'Thread access granted',
      });
      await getThreadAccess(threadId);
    } catch (err) {
      handleError(err, 'Failed to accept thread invite');
    }
  }, [user?.id, token, handleError, getThreadAccess, toast]);

  // Reset state when auth changes
  useEffect(() => {
    if (!user?.id || !token) {
      setCurrentThread(null);
      setThreads([]);
      setError(null);
      setParticipants([]);
      setUserRole('viewer');
    }
  }, [user?.id, token]);

  // Update loading state to include websocket loading
  useEffect(() => {
    setLoading(loading || wsLoading);
  }, [loading, wsLoading]);

  const value = {
    threads,
    currentThread,
    loading,
    error,
    isConnected,
    participants,
    userRole,
    fetchThreads,
    fetchThread,
    createThread,
    sendMessage,
    updateThread,
    deleteThread,
    shareThread,
    acceptThreadInvite,
    getThreadAccess
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}