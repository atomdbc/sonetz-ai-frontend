'use client';

import { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
  SendHorizontal, 
  Loader2, 
  Paperclip, 
  Mic,
  ImagePlus 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export default function ChatInput({
  onSend,
  isLoading = false,
  disabled = false,
  placeholder = "Type a message...",
  className
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [rows, setRows] = useState(1);
  const [isSending, setIsSending] = useState(false);

  const updateRows = () => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      
      const lineHeight = 24;
      const minHeight = lineHeight;
      const maxHeight = lineHeight * 5;
      const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
      
      textarea.style.height = `${newHeight}px`;
      setRows(Math.ceil(newHeight / lineHeight));
    }
  };

  useEffect(() => {
    updateRows();
  }, [message]);

  const handleSend = async () => {
    if (message.trim() && !disabled && !isSending) {
      try {
        setIsSending(true);
        await onSend(message.trim());
        setMessage('');
        setRows(1);
        if (textareaRef.current) {
          textareaRef.current.style.height = '24px';
          textareaRef.current.focus();
        }
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const inputDisabled = disabled;
  const buttonDisabled = !message.trim() || disabled;
  
  // Only show loading when actively sending
  const showLoadingIcon = isSending;

  const upcomingFeatures = [
    { icon: Paperclip, tooltip: "Upload files (coming soon)" },
    { icon: ImagePlus, tooltip: "Upload images (coming soon)" },
    { icon: Mic, tooltip: "Voice input (coming soon)" }
  ];

  return (
    <TooltipProvider>
      <div className={cn("relative flex items-center gap-2 bg-background p-2", className)}>
        <div className="flex gap-1">
          {upcomingFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8",
                      "hover:bg-muted/50 cursor-not-allowed"
                    )}
                    disabled
                  >
                    <Icon className="h-4 w-4 text-muted-foreground/60" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{feature.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        <div className="relative flex-1">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={inputDisabled || isSending}
            className={cn(
              "resize-none px-3 py-1.5 min-h-[24px] max-h-[120px] overflow-y-auto",
              "text-sm leading-relaxed",
              "border rounded-lg",
              "focus:ring-1 focus:ring-offset-0",
              (disabled || isSending) && "cursor-not-allowed opacity-50"
            )}
            style={{
              paddingRight: '2.5rem'
            }}
          />
          <Button
            size="icon"
            variant={buttonDisabled ? "ghost" : "default"}
            className={cn(
              "absolute right-1",
              rows === 1 ? "top-1" : "bottom-1",
              "h-6 w-6",
              buttonDisabled && "opacity-50",
              showLoadingIcon && "cursor-not-allowed"
            )}
            onClick={handleSend}
            disabled={buttonDisabled || showLoadingIcon}
          >
            {showLoadingIcon ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <SendHorizontal className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}