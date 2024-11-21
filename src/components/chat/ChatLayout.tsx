// components/chat/ChatLayout.tsx
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { ThreadsList } from './ThreadsList';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface ChatLayoutProps {
  children: React.ReactNode;
}

export default function ChatLayout({ children }: ChatLayoutProps) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden">
      {isDesktop ? (
        <aside className="w-80 flex-shrink-0 border-r bg-background lg:w-96">
          <ThreadsList />
        </aside>
      ) : (
        <>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="fixed left-4 top-4 z-40 h-8 w-8 bg-background/50 backdrop-blur-sm"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="left" 
              className="w-80 p-0 border-r"
              onInteractOutside={() => setOpen(false)}
              onEscapeKeyDown={() => setOpen(false)}
            >
              <ThreadsList onThreadSelect={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
        </>
      )}

      <main className="flex-1 relative">
        {!isDesktop && <div className="h-16" />} {/* Spacer for mobile header */}
        <div className="h-full overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}