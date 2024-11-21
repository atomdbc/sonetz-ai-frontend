// src/hooks/use-thread.ts
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/apiClient';
import type { ThreadResponse, MessageResponse } from '@/types/thread';

export function useThread(threadId?: string) {
  const [thread, setThread] = useState<ThreadResponse>();
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  useEffect(() => {
    if (!threadId) {
      setIsLoading(false);
      return;
    }

    async function fetchThreadData() {
        try {
          const [threadRes, messagesRes] = await Promise.all([
            apiClient.get(`${baseUrl}/threads/${threadId}`),
            apiClient.get(`${baseUrl}/threads/${threadId}/messages`)
          ]);
          setThread(threadRes.data);
          setMessages(messagesRes.data);
        } catch (error) {
          console.error('Error fetching thread:', error);
        } finally {
          setIsLoading(false);
        }
      }

    fetchThreadData();
  }, [threadId]);

  return { thread, messages, isLoading };
}