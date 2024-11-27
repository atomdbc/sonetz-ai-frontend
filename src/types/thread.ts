// src/types/thread.ts

export interface ThreadParticipant {
  id: string;
  user_id: string;
  thread_id: string;
  role: 'owner' | 'contributor' | 'viewer';
  email?: string;
  share_id?: string;
  share_expires_at?: string;
  share_metadata?: {
    shared_by?: string;
    shared_at?: string;
    message?: string;
    status?: 'pending' | 'accepted' | 'expired';
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_accessed_at?: string;
}

export interface Thread {
  id: string;
  user_id: string;
  title: string;
  status: 'active' | 'archived' | 'deleted';
  type: 'user' | 'agent';
  context: any;
  thread_metadata: {
    private?: boolean;
    shares?: Record<string, any>;
  };
  participants?: ThreadParticipant[];
  userRole?: 'owner' | 'contributor' | 'viewer';
  created_at: string;
  updated_at: string;
  last_message_at?: string; // Ensure consistent naming
}

export interface ThreadUpdate {
  title?: string;
  status?: 'active' | 'paused' | 'archived' | 'deleted';
  context?: Record<string, any>;
  thread_metadata?: Record<string, any>;
}

export interface ThreadShare {
  email: string;
  role: 'contributor' | 'viewer';
  message?: string;
  expires_at?: string;
}

export interface ThreadShareResponse {
  status: string;
  message: string;
  share_id: string;
  participant?: ThreadParticipant;
}

export interface ThreadAccess {
  thread: Thread;
  role: 'owner' | 'contributor' | 'viewer';
  share_id?: string;
  access_type?: 'direct' | 'share';
  access_metadata?: {
    expires_at?: string;
    shared_by?: string;
    shared_at?: string;
  };
}

export interface ParticipantUpdate {
  role: 'contributor' | 'viewer';
  share_expires_at?: string;
  is_active?: boolean;
}
