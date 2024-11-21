'use client';

import { Thread } from '@/types/thread';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MessageSquare } from 'lucide-react';
import { useParams } from 'next/navigation';

interface ThreadItemProps {
  thread: Thread;
  onClick: () => void;
}

export function ThreadItem({ thread, onClick }: ThreadItemProps) {
  const params = useParams();
  const isActive = params.threadId === thread.id;

  return (
    <Button
      variant="ghost"
      className={cn(
        'w-full justify-start space-x-2',
        isActive && 'bg-accent'
      )}
      onClick={onClick}
    >
      <MessageSquare className="h-4 w-4" />
      <span className="truncate">{thread.title}</span>
    </Button>
  );
}