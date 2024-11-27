'use client';

import { Thread } from '@/types/thread';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { MessageSquare, Users, Eye, Lock } from 'lucide-react';
import { useParams } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ThreadItemProps {
  thread: Thread;
  onClick: () => void;
  currentUserId: string;
}

export function ThreadItem({ thread, onClick, currentUserId }: ThreadItemProps) {
  const params = useParams();
  const isActive = params.threadId === thread.id;

  // Get participant count excluding owner
  const participantCount = thread.participants
    ? thread.participants.filter(p => p.user_id !== thread.user_id && p.is_active).length
    : 0;

  // Determine the user's role in the thread
  const userRole = thread.user_id === currentUserId ? 'owner' : thread.userRole || 'viewer';

  // Helper for role badge
  const getRoleBadge = () => {
    switch (userRole) {
      case 'owner':
        return (
          <Badge variant="secondary" className="h-5 px-1.5">
            Owner
          </Badge>
        );
      case 'contributor':
        return (
          <Badge variant="secondary" className="h-5 px-1.5">
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
  };

  return (
    <TooltipProvider>
      <div className="group relative px-1.5 py-1">
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start text-left relative pr-16',
            isActive && 'bg-accent'
          )}
          onClick={onClick}
        >
          <div className="flex items-center space-x-2 min-w-0">
            {/* Thread icon - show lock for private threads */}
            {thread.thread_metadata?.private ? (
              <Lock className="h-4 w-4 shrink-0" />
            ) : (
              <MessageSquare className="h-4 w-4 shrink-0" />
            )}

            {/* Thread title */}
            <span className="truncate flex-1">{thread.title}</span>

            {/* Role badge */}
            {getRoleBadge()}
          </div>

          {/* Participant count */}
          {participantCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="ml-1 text-xs">{participantCount}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {participantCount} {participantCount === 1 ? 'participant' : 'participants'}
              </TooltipContent>
            </Tooltip>
          )}
        </Button>

        {/* Status indicators could go here */}
      </div>
    </TooltipProvider>
  );
}
