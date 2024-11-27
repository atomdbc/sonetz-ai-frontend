import { apiClient } from '@/lib/api/apiClient';
import { 
  Thread, 
  ThreadShare, 
  ThreadShareResponse, 
  ThreadUpdate,
  ThreadParticipant,
  ThreadAccess 
} from '@/types/thread';
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

interface ThreadWithRole extends Thread {
  userRole?: 'owner' | 'contributor' | 'viewer';
}

export const chatService = {
  // Helper function to determine user role in a thread
  private getUserRole(thread: Thread): 'owner' | 'contributor' | 'viewer' {
    const participant = thread.participants?.find(p => p.is_active);
    return participant?.role || 'viewer';
  },

  // Thread operations
  async getThreads(params?: ThreadListParams): Promise<ThreadWithRole[]> {
    try {
      const { data } = await apiClient.get('/agent/threads', { params });
      const threads = Array.isArray(data) ? data : [];
      // Add user role to each thread
      return threads.map(thread => ({
        ...thread,
        userRole: this.getUserRole(thread)
      }));
    } catch (error) {
      console.error('Error getting threads:', error);
      return [];
    }
  },

  async getThread(threadId: string): Promise<ThreadWithRole | null> {
    try {
      const { data } = await apiClient.get(`/agent/threads/${threadId}`);
      if (!data) return null;
      return {
        ...data,
        userRole: this.getUserRole(data)
      };
    } catch (error) {
      console.error('Error getting thread:', error);
      return null;
    }
  },

  async createThread(title: string): Promise<ThreadWithRole> {
    try {
      const { data } = await apiClient.post('/agent/threads', {
        title,
        context: {}, 
        thread_metadata: {} 
      });
      // For new threads, the creator is always the owner
      return {
        ...data,
        userRole: 'owner'
      };
    } catch (error) {
      console.error('Error creating thread:', error);
      throw error;
    }
  },

  async updateThread(threadId: string, updates: ThreadUpdate): Promise<ThreadWithRole> {
    const { data } = await apiClient.patch(`/agent/threads/${threadId}`, updates);
    return {
      ...data,
      userRole: this.getUserRole(data)
    };
  },

  async deleteThread(threadId: string): Promise<void> {
    await apiClient.delete(`/agent/threads/${threadId}`);
  },

  async getMessages(threadId: string, params?: MessageListParams): Promise<Message[]> {
    try {
      const { data } = await apiClient.get(`/agent/threads/${threadId}/messages`, { params });
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  },

  // Share and Access operations
  async shareThread(threadId: string, shareData: ThreadShare): Promise<ThreadShareResponse> {
    const { data } = await apiClient.post<ThreadShareResponse>(`/agent/threads/${threadId}/share`, shareData);
    return data;
  },

  async getThreadAccess(threadId: string, shareId?: string): Promise<ThreadAccess> {
    const url = shareId ? 
      `/agent/threads/share/${threadId}?share_id=${shareId}` : 
      `/agent/threads/share/${threadId}`;
    const { data } = await apiClient.get<ThreadAccess>(url);
    return data;
  },

  async acceptThreadInvite(threadId: string, shareId: string): Promise<{
    message: string;
    thread: ThreadWithRole;
    participant: ThreadParticipant;
  }> {
    const { data } = await apiClient.post(`/agent/threads/${threadId}/accept-invite`, { 
      share_id: shareId 
    });
    return {
      ...data,
      thread: {
        ...data.thread,
        userRole: this.getUserRole(data.thread)
      }
    };
  },

  // Participant operations
  async getThreadParticipants(threadId: string): Promise<ThreadParticipant[]> {
    try {
      const { data } = await apiClient.get(`/agent/threads/${threadId}/participants`);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error getting thread participants:', error);
      return [];
    }
  },

  async updateParticipantRole(
    threadId: string, 
    userId: string, 
    role: 'contributor' | 'viewer'
  ): Promise<ThreadParticipant> {
    const { data } = await apiClient.patch(`/agent/threads/${threadId}/participants/${userId}`, {
      role
    });
    return data;
  },

  async removeParticipant(threadId: string, userId: string): Promise<void> {
    await apiClient.delete(`/agent/threads/${threadId}/participants/${userId}`);
  }
};