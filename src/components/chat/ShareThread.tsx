'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThreadRole } from '@/types/thread';
import { Mail, Link2, Copy, Check, Loader2, Globe, Users } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { chatService } from '@/services/chatService';

interface ShareDialogProps {
  threadId: string;
  onClose: () => void;
}

export function ShareDialog({ threadId, onClose }: ShareDialogProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<ThreadRole>('viewer');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const { toast } = useToast();

  // Generate a secure share URL using your backend structure
  const shareUrl = `${window.location.origin}/share/${threadId}?role=${role}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        description: "Link copied to clipboard",
      });
    } catch (error) {
      toast({
        description: "Failed to copy link",
        variant: "destructive"
      });
    }
  };

  const handleShareByEmail = async () => {
    if (!email) return;

    setSharing(true);
    try {
      await chatService.shareThread(threadId, {
        email,
        role,
        message: message.trim() || undefined
      });

      toast({
        description: `Shared successfully with ${email}`,
      });
      onClose();
    } catch (error) {
      toast({
        description: "Failed to share. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSharing(false);
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Users className="h-5 w-5" />
            Share Thread
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="email" className="mt-4">
          <TabsList className="grid w-full grid-cols-2 h-11">
            <TabsTrigger value="email" className="flex gap-2">
              <Mail className="h-4 w-4" />
              Share via Email
            </TabsTrigger>
            <TabsTrigger value="link" className="flex gap-2">
              <Link2 className="h-4 w-4" />
              Get Link
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="mt-4 space-y-4">
            <div className="space-y-4">
              <div className="space-y-2.5">
                <Label className="text-sm font-medium">
                  Email address
                </Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className={`${!isValidEmail(email) && email ? 'border-destructive' : ''}`}
                />
                {!isValidEmail(email) && email && (
                  <p className="text-xs text-destructive">Please enter a valid email</p>
                )}
              </div>

              <div className="space-y-2.5">
                <Label className="text-sm font-medium">
                  Permission
                </Label>
                <Select value={role} onValueChange={(value) => setRole(value as ThreadRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">View only</span>
                        <span className="text-xs text-muted-foreground">Can read messages</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="contributor">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">Can contribute</span>
                        <span className="text-xs text-muted-foreground">Can read and send messages</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2.5">
                <Label className="text-sm font-medium">
                  Add a message (optional)
                </Label>
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write a message..."
                />
              </div>
            </div>

            <Button 
              className="w-full" 
              onClick={handleShareByEmail}
              disabled={!email || !isValidEmail(email) || sharing}
            >
              {sharing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sharing...
                </>
              ) : (
                'Share thread'
              )}
            </Button>
          </TabsContent>

          <TabsContent value="link" className="mt-4 space-y-4">
            <div className="space-y-4">
              <div className="space-y-2.5">
                <Label className="text-sm font-medium">Share link</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute left-3 top-2.5 text-muted-foreground">
                      <Globe className="h-4 w-4" />
                    </div>
                    <Input
                      readOnly
                      value={shareUrl}
                      className="pl-9 pr-20 font-mono text-sm"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute right-1 top-1 h-7"
                      onClick={handleCopyLink}
                      disabled={copied}
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <Label className="text-sm font-medium">
                  Permission for link
                </Label>
                <Select value={role} onValueChange={(value) => setRole(value as ThreadRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">View only</span>
                        <span className="text-xs text-muted-foreground">Can read messages</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="contributor">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">Can contribute</span>
                        <span className="text-xs text-muted-foreground">Can read and send messages</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}