import { apiClient } from '@/lib/api/apiClient';
import { Thread, ThreadShare, ThreadUpdate } from '@/types/thread';
import { Message } from '@/types/message';

interface ThreadListParams {
  status?: string;
  limit?: number;
  offset?: number;
}

interface MessageListParams {
  beforeId?: string;
  limit?: number;
}

export const chatService = {
  // Thread operations
  async getThreads(params?: ThreadListParams): Promise<Thread[]> {
    const { data } = await apiClient.get('/threads', { params });
    return data;
  },

  async getThread(threadId: string): Promise<Thread> {
    const { data } = await apiClient.get(`/threads/${threadId}`);
    return data;
  },

  async createThread(title?: string): Promise<Thread> {
    const { data } = await apiClient.post('/threads', { title });
    return data;
  },

  async updateThread(threadId: string, updates: ThreadUpdate): Promise<Thread> {
    const { data } = await apiClient.patch(`/threads/${threadId}`, updates);
    return data;
  },

  async deleteThread(threadId: string): Promise<void> {
    await apiClient.delete(`/threads/${threadId}`);
  },

  // Message operations
  async getMessages(threadId: string, params?: MessageListParams): Promise<Message[]> {
    const { data } = await apiClient.get(`/threads/${threadId}/messages`, { params });
    return data;
  },

  // Sharing operations
  async shareThread(threadId: string, shareData: ThreadShare): Promise<{ status: string; message: string }> {
    const { data } = await apiClient.post(`/threads/${threadId}/share`, shareData);
    return data;
  },

  // WebSocket connection helper
  getWebSocketUrl(threadId: string, token: string, userId: string): string {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || window.location.origin.replace(/^http/, 'ws');
    return `${wsUrl}/ws/chat/${threadId}?token=${token}&user_id=${userId}`;
  }
};