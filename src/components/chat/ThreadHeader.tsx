'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Thread } from '@/types/thread';
import { ShareDialog } from './ShareThread';
import { ArrowLeft, MoreHorizontal, Share2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ThreadHeaderProps {
  thread?: Thread;
  isMobile?: boolean;
}

export default function ThreadHeader({ thread, isMobile }: ThreadHeaderProps) {
  const [showShareDialog, setShowShareDialog] = useState(false);
  const router = useRouter();

  const handleArchive = async () => {
    if (!thread?.id) return;
    // Implement archive logic
  };

  return (
    <div className="border-b bg-white/80 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
              onClick={() => router.push('/chat')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <h2 className="text-base font-medium truncate">
            {thread?.title || 'New Chat'}
          </h2>
        </div>
        
        {thread && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowShareDialog(true)}
            >
              <Share2 className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setShowShareDialog(true)}>
                  Share Thread
                </DropdownMenuItem>
                {thread.status !== 'archived' && (
                  <DropdownMenuItem onClick={handleArchive}>
                    Archive Thread
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {showShareDialog && thread && (
        <ShareDialog
          threadId={thread.id}
          onClose={() => setShowShareDialog(false)}
        />
      )}
    </div>
  );
}