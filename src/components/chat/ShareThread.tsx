'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThreadRole, ThreadParticipant } from '@/types/thread';
import { Mail, Link2, Copy, Check, Loader2, Globe, Users, Info, Eye, Send, Clock, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { chatService } from '@/services/chatService';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ShareDialogProps {
  threadId: string;
  onClose: () => void;
}

export function ShareDialog({ threadId, onClose }: ShareDialogProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'viewer' | 'contributor'>('viewer');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [activeTab, setActiveTab] = useState<'email' | 'link' | 'manage'>('email');
  const [participants, setParticipants] = useState<ThreadParticipant[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Generate share link with share ID if available
  const shareUrl = `${window.location.origin}/share/${threadId}`;

  // Fetch participants when dialog opens
  useEffect(() => {
    const fetchParticipants = async () => {
      setLoading(true);
      try {
        const data = await chatService.getThreadParticipants(threadId);
        setParticipants(data);
      } catch (error) {
        console.error('Error fetching participants:', error);
        toast({
          description: "Failed to load participants",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [threadId, toast]);

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
    if (!email || !isValidEmail(email)) return;

    setSharing(true);
    try {
      const shareData = {
        email,
        role: role,
        message: message.trim() || undefined
      };

      const response = await chatService.shareThread(threadId, shareData);
      
      if (response.status === 'success' && response.participant) {
        setParticipants(prev => [...prev, response.participant]);
        toast({
          title: "Thread shared",
          description: `Invitation sent to ${email}`,
        });
        // Clear form
        setEmail('');
        setMessage('');
        setRole('viewer');
        // Switch to manage tab
        setActiveTab('manage');
      } else {
        throw new Error(response.message || 'Failed to share thread');
      }
    } catch (error) {
      console.error('Share error:', error);
      toast({
        title: "Share failed",
        description: error instanceof Error ? error.message : "Failed to share. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSharing(false);
    }
  };

  const handleUpdateRole = async (participantId: string, newRole: 'viewer' | 'contributor') => {
    try {
      const updated = await chatService.updateParticipantRole(threadId, participantId, newRole);
      setParticipants(prev => 
        prev.map(p => p.user_id === participantId ? { ...p, role: newRole } : p)
      );
      toast({
        description: "Participant role updated",
      });
    } catch (error) {
      toast({
        description: "Failed to update role",
        variant: "destructive"
      });
    }
  };

  const handleRemoveParticipant = async (participantId: string) => {
    try {
      await chatService.removeParticipant(threadId, participantId);
      setParticipants(prev => prev.filter(p => p.user_id !== participantId));
      toast({
        description: "Participant removed",
      });
    } catch (error) {
      toast({
        description: "Failed to remove participant",
        variant: "destructive"
      });
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0">
        <DialogHeader className="p-6 pb-4 space-y-2">
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Users className="h-5 w-5" />
            Share Thread
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Invite others to view or contribute to this conversation
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'email' | 'link' | 'manage')} className="px-6">
          <TabsList className="grid w-full grid-cols-3 h-11">
            <TabsTrigger value="email" className="flex gap-2">
              <Mail className="h-4 w-4" />
              <span className="font-medium">Email</span>
            </TabsTrigger>
            <TabsTrigger value="link" className="flex gap-2">
              <Link2 className="h-4 w-4" />
              <span className="font-medium">Link</span>
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex gap-2">
              <Users className="h-4 w-4" />
              <span className="font-medium">Manage</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="mt-6 space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Email address</Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className={`mt-1.5 ${!isValidEmail(email) && email ? 'border-destructive' : ''}`}
                />
                {!isValidEmail(email) && email && (
                  <p className="text-xs text-destructive mt-1">Please enter a valid email address</p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium flex items-center justify-between">
                  Permission level
                  <Badge variant="secondary" className="font-normal">
                    <Eye className="h-3 w-3 mr-1" />
                    {role === 'viewer' ? 'View only' : 'Can contribute'}
                  </Badge>
                </Label>
                <Select value={role} onValueChange={(value: 'viewer' | 'contributor') => setRole(value)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">View only</p>
                          <p className="text-xs text-muted-foreground">Can read messages</p>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="contributor">
                      <div className="flex items-center gap-2">
                        <Send className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Contributor</p>
                          <p className="text-xs text-muted-foreground">Can read and send messages</p>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Add a message (optional)</Label>
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a personal note..."
                  className="mt-1.5"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="link" className="mt-6 space-y-4">
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Anyone with this link can view this conversation.</p>
                <p className="text-xs">Links expire after 30 days for security</p>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-1.5 block">Share link</Label>
              <div className="relative">
                <div className="absolute left-3 top-2.5 text-muted-foreground">
                  <Globe className="h-4 w-4" />
                </div>
                <Input
                  readOnly
                  value={shareUrl}
                  className="pl-9 pr-20 font-mono text-sm bg-muted/50"
                />
                <Button
                  size="sm"
                  variant={copied ? "secondary" : "ghost"}
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
          </TabsContent>

          <TabsContent value="manage" className="mt-6">
            <div className="space-y-4">
              <Label className="text-sm font-medium">Participants</Label>
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : participants.length === 0 ? (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  No participants yet
                </div>
              ) : (
                <ScrollArea className="h-[200px] pr-4">
                  <div className="space-y-3">
                    {participants.map((participant) => (
                      <div
                        key={participant.user_id}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">
                              {participant.email}
                            </span>
                            <Badge variant="secondary" className="shrink-0">
                              {participant.role}
                            </Badge>
                          </div>
                          {participant.last_accessed_at && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <Clock className="h-3 w-3" />
                              Last accessed {formatDate(participant.last_accessed_at)}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Select
                            value={participant.role}
                            onValueChange={(value: 'viewer' | 'contributor') => 
                              handleUpdateRole(participant.user_id, value)
                            }
                          >
                            <SelectTrigger className="h-8 w-[110px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="viewer">View only</SelectItem>
                              <SelectItem value="contributor">Contributor</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => handleRemoveParticipant(participant.user_id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <Separator className="my-6" />

        <div className="px-6 pb-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {activeTab === 'email' && (
            <Button 
              onClick={handleShareByEmail}
              disabled={!email || !isValidEmail(email) || sharing}
            >
              {sharing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sharing...
                </>
              ) : (
                'Send invite'
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}