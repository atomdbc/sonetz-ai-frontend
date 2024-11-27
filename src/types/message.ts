// types/message.ts
export interface Message {
  id: string;
  thread_id: string;
  content: string;
  role: 'user' | 'agent' | 'system';
  type: 'text' | 'action' | 'thought' | 'memory';
  agent_id?: string;
  parent_id?: string;
  message_metadata?: {
    participant_id?: string;
    user_role?: 'owner' | 'contributor' | 'viewer';
    share_id?: string;
    tokens?: number;
    [key: string]: any;
  };
  created_at: string;
  processed_at?: string;
  isStreaming?: boolean;
}

export interface MessageCreate {
  content: string;
  role: 'user' | 'agent' | 'system';
  type: 'text' | 'action' | 'thought' | 'memory';
  agent_id?: string;
  parent_id?: string;
  message_metadata?: Record<string, any>;
}

export interface MessageResponse extends Message {
  participant?: {
    user_id: string;
    role: 'owner' | 'contributor' | 'viewer';
    email?: string;
  };
}


export function cleanMessageContent(content: string): string {
  try {
    // Handle user messages that are JSON strings
    if (content.startsWith('{') && content.includes('content')) {
      try {
        const parsed = JSON.parse(content);
        return parsed.content;
      } catch {
        // If JSON parse fails, continue with other cleaning
      }
    }

    // Extract content after Final Answer if it exists
    const finalAnswerMatch = content.match(/Final Answer:(.*?)(?=$)/s);
    if (finalAnswerMatch) {
      return finalAnswerMatch[1].trim();
    }

    // If no Final Answer, remove thought process and return clean content
    const cleanContent = content
      .replace(/^Thought:.*?(?=(?:\n\n|$))/gms, '')
      .replace(/^Action:.*?(?=(?:\n\n|$))/gms, '')
      .replace(/^Action Input:.*?(?=(?:\n\n|$))/gms, '')
      .replace(/^Human:/g, '')
      .replace(/^\s*\{[^}]+\}\s*$/gm, '')
      .trim();

    return cleanContent || content;
  } catch (e) {
    return content;
  }
}