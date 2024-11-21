'use client';

import { Card } from '@/components/ui/card';
import { MessageSquare, Bot, Settings } from 'lucide-react';

export function WelcomeScreen() {
  return (
    <div className="h-full flex items-center justify-center p-4">
      <Card className="max-w-lg p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center">
          Welcome to Sonetz AI Assistant
        </h1>
        
        <p className="text-center text-muted-foreground">
          Your AI-powered business assistant that helps you get things done.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2 text-center">
            <div className="mx-auto w-fit p-2 bg-primary/10 rounded-full">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h2 className="font-semibold">Natural Conversations</h2>
            <p className="text-sm text-muted-foreground">
              Chat naturally with advanced AI understanding
            </p>
          </div>

          <div className="space-y-2 text-center">
            <div className="mx-auto w-fit p-2 bg-primary/10 rounded-full">
              <Bot className="w-6 h-6" />
            </div>
            <h2 className="font-semibold">Smart Assistance</h2>
            <p className="text-sm text-muted-foreground">
              Get help with tasks, analysis, and more
            </p>
          </div>

          <div className="space-y-2 text-center">
            <div className="mx-auto w-fit p-2 bg-primary/10 rounded-full">
              <Settings className="w-6 h-6" />
            </div>
            <h2 className="font-semibold">Customizable</h2>
            <p className="text-sm text-muted-foreground">
              Adapts to your work style and preferences
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}