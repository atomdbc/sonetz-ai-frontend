// types/message.ts
export interface Message {
  id: string;
  thread_id: string;
  content: string;
  role: 'user' | 'agent';
  type: 'text' | 'image' | 'file';
  created_at: string;
  processed_at?: string;
  isStreaming?: boolean;
  agent_id?: string | null;
  parent_id?: string | null;
  message_metadata?: Record<string, any>;
  tokens?: number | null;
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