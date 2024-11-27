// src/components/chat/ThreadsList.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ThreadItem } from './ThreadItem';
import { Thread } from '@/types/thread';
import { chatService } from '@/services/chatService';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth/authContext';
import { Separator } from '@/components/ui/separator';

interface ThreadsListProps {
  onThreadSelect?: () => void;
}

export function ThreadsList({ onThreadSelect }: ThreadsListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');

  useEffect(() => {
    fetchThreads();
  }, []);

  const fetchThreads = async () => {
    try {
      setLoading(true);
      const response = await chatService.getThreads({
        limit: 50,
        offset: 0,
      });
      const threadsData = Array.isArray(response) ? response : [];
      setThreads(threadsData);
    } catch (error) {
      console.error('Error fetching threads:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversations',
        variant: 'destructive',
      });
      setThreads([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewThread = async () => {
    try {
      const thread = await chatService.createThread('New Conversation');
      setThreads((prev) => [thread, ...prev]);
      router.push(`/chat/${thread.id}`);
      onThreadSelect?.();
    } catch (error) {
      console.error('Error creating thread:', error);
      toast({
        title: 'Error',
        description: 'Failed to create new conversation',
        variant: 'destructive',
      });
    }
  };

  const filteredThreads = threads.filter((thread) =>
    thread.title.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 sm:p-4 border-b space-y-3">
        <Button
          onClick={handleNewThread}
          className="w-full h-10 sm:h-11"
          variant="secondary"
          disabled={loading}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>

        <Input
          placeholder="Search threads..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="w-full"
        />
      </div>

      <ScrollArea className="flex-1">
        {loading ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            Loading conversations...
          </div>
        ) : filteredThreads.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            No conversations found
          </div>
        ) : (
          <div className="py-2">
            {filteredThreads.map((thread) => (
              <ThreadItem
                key={thread.id}
                thread={thread}
                currentUserId={user?.id || ''}
                onClick={() => {
                  router.push(`/chat/${thread.id}`);
                  onThreadSelect?.();
                }}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Added links and buttons at the bottom */}
      <div className="mt-auto border-t">
        <Button
          variant="ghost"
          className="w-full justify-start h-11 px-3 text-sm font-normal"
          onClick={() => {
            toast({ description: 'Clear conversations feature coming soon' });
          }}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear conversations
        </Button>

        <Separator className="my-2" />

        <nav className="px-3 pb-3">
          <div className="space-y-1 text-sm text-muted-foreground/70">
            <Link
              href="/ai-policy"
              className="flex h-9 items-center px-2 hover:bg-accent rounded-md transition-colors"
            >
              AI Policy
            </Link>
            <Link
              href="/help-center"
              className="flex h-9 items-center px-2 hover:bg-accent rounded-md transition-colors"
            >
              Help Center
            </Link>
            <Link
              href="/feedback"
              className="flex h-9 items-center px-2 hover:bg-accent rounded-md transition-colors"
            >
              Feedback
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}
