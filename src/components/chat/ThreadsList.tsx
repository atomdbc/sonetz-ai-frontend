'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ThreadItem } from './ThreadItem';
import { Thread } from '@/types/thread';
import { chatService } from '@/services/chatService';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface ThreadsListProps {
  onThreadSelect?: () => void;
}

interface GroupedThreads {
  [key: string]: Thread[];
}



export function ThreadsList({ onThreadSelect }: ThreadsListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchThreads();
  }, []);

  const fetchThreads = async () => {
    try {
      setLoading(true);
      const data = await chatService.getThreads({
        limit: 20,
        offset: 0
      });
      setThreads(data);
    } catch (error) {
      console.error('Error fetching threads:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewThread = async () => {
    try {
      const thread = await chatService.createThread('New Conversation');
      setThreads(prev => [thread, ...prev]);
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

  const groupThreadsByDate = (threads: Thread[]): GroupedThreads => {
    const grouped: GroupedThreads = {
      'Today': [],
      'Yesterday': [],
      'Last 7 days': [],
      'Older': []
    };

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    threads.forEach(thread => {
      const threadDate = new Date(thread.created_at);
      if (threadDate.toDateString() === today.toDateString()) {
        grouped['Today'].push(thread);
      } else if (threadDate.toDateString() === yesterday.toDateString()) {
        grouped['Yesterday'].push(thread);
      } else if (threadDate > lastWeek) {
        grouped['Last 7 days'].push(thread);
      } else {
        grouped['Older'].push(thread);
      }
    });

    return grouped;
  };

  const groupedThreads = groupThreadsByDate(threads);

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 sm:p-4 border-b">
        <Button
          onClick={handleNewThread}
          className="w-full h-10 sm:h-11"
          variant="secondary"
          disabled={loading}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {loading ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            Loading conversations...
          </div>
        ) : threads.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            No conversations yet
          </div>
        ) : (
          <div className="py-2">
            {Object.entries(groupedThreads).map(([date, dateThreads]) => 
              dateThreads.length > 0 && (
                <div key={date} className="mb-3">
                  <h3 className="px-3 mb-1 text-xs font-medium text-muted-foreground uppercase">
                    {date}
                  </h3>
                  <div>
                    {dateThreads.map((thread) => (
                      <ThreadItem
                        key={thread.id}
                        thread={thread}
                        onClick={() => {
                          router.push(`/chat/${thread.id}`);
                          onThreadSelect?.();
                        }}
                      />
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </ScrollArea>

      <div className="mt-auto border-t">
        <Button 
          variant="ghost" 
          className="w-full justify-start h-11 px-3 text-sm font-normal"
          onClick={() => toast({ description: "Clear conversations feature coming soon" })}
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
