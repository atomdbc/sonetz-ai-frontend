import { Message } from "./message";

export type ThreadStatus = 'active' | 'paused' | 'archived' | 'deleted';
export type ThreadInitiator = 'user' | 'agent';
export type ThreadRole = 'viewer' | 'contributor' | 'owner';

export interface Thread {
  id: string;
  userId: string;
  title: string;
  type: ThreadInitiator;
  status: ThreadStatus;
  context: Record<string, any>;
  threadMetadata: Record<string, any>;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
  lastMessageAt?: string;
  messages?: Message[];
}

export interface ThreadShare {
  email: string;
  role: ThreadRole;
  message?: string;
}