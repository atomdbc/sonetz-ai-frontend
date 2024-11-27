// src/components/chat/MessageGroup.tsx

'use client';

import { Message } from '@/types/message';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Copy, ThumbsUp, ThumbsDown, Crown, Eye, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageGroupProps {
  message: Message;
  isLastInGroup: boolean;
  isOwner: boolean;
  currentUserId: string;
  threadOwnerId: string;
}

export default function MessageGroup({
  message,
  isLastInGroup,
  isOwner,
  currentUserId,
  threadOwnerId,
}: MessageGroupProps) {
  const { toast } = useToast();
  const isMobile = useMediaQuery('(max-width: 640px)');

  const userRole = message.message_metadata?.user_role || 'viewer';
  const participantEmail = message.message_metadata?.participant_email;

  const isCurrentUserOwner = currentUserId === threadOwnerId;

  const getUserRoleBadge = () => {
    // Don't show any badge on the current user's own messages
    if (message.message_metadata?.user_id === currentUserId) {
      return null;
    }

    // Only apply badges to user messages (exclude AI messages)
    if (message.role === 'user') {
      if (isOwner) {
        return (
          <Badge
            variant="default"
            className="h-5 px-1.5 bg-purple-500/10 text-purple-500 hover:bg-purple-500/20"
          >
            <Crown className="h-3 w-3 mr-1" />
            Owner
          </Badge>
        );
      }

      switch (userRole) {
        case 'contributor':
          return (
            <Badge variant="secondary" className="h-5 px-1.5">
              <Users className="h-3 w-3 mr-1" />
              Contributor
            </Badge>
          );
        case 'viewer':
          return (
            <Badge variant="outline" className="h-5 px-1.5">
              <Eye className="h-3 w-3 mr-1" />
              Viewer
            </Badge>
          );
        default:
          return null;
      }
    }

    return null;
  };

  // Removed getCleanContent function here

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      toast({ description: 'Message copied' });
    } catch (error) {
      toast({
        description: 'Failed to copy message',
        variant: 'destructive',
      });
    }
  };

  const handleFeedback = (type: 'up' | 'down') => {
    toast({
      description: 'Feedback recorded - Thanks!',
      duration: 1500,
    });
  };

  const formatTimestamp = (date: string) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return `Today at ${messageDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${messageDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    } else {
      return messageDate.toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const cleanContent = message.content; // Use message.content directly

  // Adjust the condition to check for null or undefined
  if (cleanContent === null || cleanContent === undefined) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex gap-2 sm:gap-3 px-2 sm:px-4',
        message.role === 'user' ? 'justify-end' : 'justify-start'
      )}
    >
      {message.role === 'agent' && (
        <Avatar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
          <img src="/aira_avatar.jpg" alt="AI" className="rounded-full" />
        </Avatar>
      )}

      <div
        className={cn(
          'group flex flex-col relative',
          message.role === 'user' ? 'items-end' : 'items-start',
          isMobile ? 'max-w-[85%]' : 'max-w-[70%]'
        )}
      >
        {/* Participant email and role badge */}
        {message.role === 'user' && participantEmail && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="mb-1 text-xs text-muted-foreground">
                  {participantEmail}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="flex flex-col gap-1">
                  <span>{participantEmail}</span>
                  {getUserRoleBadge()}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Message content */}
        {message.role === 'user' ? (
          // User message wrapped in Card component
          <Card
            className={cn(
              'px-3 py-2',
              'bg-white border hover:bg-gray-50',
              isOwner && !isCurrentUserOwner && 'border-purple-200' // Highlight owner's messages for non-owners
            )}
          >
            <div className="prose prose-sm sm:prose-base break-words">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {cleanContent}
              </ReactMarkdown>
            </div>
          </Card>
        ) : (
          // AI message without Card component
          <div className="px-3 py-2 bg-gray-50 rounded-lg">
            <div className="prose prose-sm sm:prose-base break-words">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {cleanContent}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* Message metadata */}
        <div className="flex items-center gap-2 mt-1">
          {getUserRoleBadge()}

          <span className="text-[11px] text-muted-foreground px-1">
            {formatTimestamp(message.created_at)}
          </span>

          {/* Feedback buttons for AI messages */}
          {message.role === 'agent' && (
            <div
              className={cn(
                'flex items-center gap-0.5 bg-white/80 rounded-md',
                isMobile
                  ? 'opacity-100'
                  : 'opacity-0 group-hover:opacity-100 transition-opacity'
              )}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={handleCopy}
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => handleFeedback('up')}
              >
                <ThumbsUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleFeedback('down')}
                className="h-5 w-5"
              >
                <ThumbsDown className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* User avatar */}
      {message.role === 'user' && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar
                className={cn(
                  'h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0',
                  isOwner &&
                    !isCurrentUserOwner &&
                    'ring-2 ring-purple-500 ring-offset-2'
                )}
              >
                <img src="/user_avatar.webp" alt="User" className="rounded-full" />
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <div className="flex flex-col gap-1">
                <span>{participantEmail}</span>
                {getUserRoleBadge()}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
