'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { MicrosoftAuthClient } from '@/lib/integrations/microsoft/auth';
import { HubSpotAuthClient } from '@/lib/integrations/hubspot/auth';
import { useToast } from '@/components/ui/use-toast';

export default function IntegrationsPage() {
  const [isConnectingMicrosoft, setIsConnectingMicrosoft] = useState(false);
  const [isConnectingHubSpot, setIsConnectingHubSpot] = useState(false);
  const { toast } = useToast();
  const [authWindow, setAuthWindow] = useState<Window | null>(null);

  // Handle messages from popup window
  const handleMessage = useCallback((event: MessageEvent) => {
    if (event.origin !== window.location.origin) return;

    if (event.data?.type === 'HUBSPOT_AUTH_CALLBACK') {
      setIsConnectingHubSpot(false);
      if (event.data.success) {
        toast({
          title: 'Successfully connected to HubSpot',
          description: 'Your HubSpot account is now connected.',
        });
        if (authWindow) {
          authWindow.close();
        }
      } else {
        toast({
          title: 'Connection failed',
          description: event.data.error || 'Failed to connect to HubSpot',
          variant: 'destructive',
        });
      }
      setAuthWindow(null);
    }
    
    if (event.data?.type === 'MICROSOFT_AUTH_CALLBACK') {
      setIsConnectingMicrosoft(false);
      if (event.data.success) {
        toast({
          title: 'Successfully connected to Microsoft',
          description: 'Your Microsoft account is now connected.',
        });
        if (authWindow) {
          authWindow.close();
        }
      } else {
        toast({
          title: 'Connection failed',
          description: event.data.error || 'Failed to connect to Microsoft',
          variant: 'destructive',
        });
      }
      setAuthWindow(null);
    }
  }, [toast, authWindow]);


  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [handleMessage]);

  // Monitor popup window status
  useEffect(() => {
    if (authWindow) {
      const checkWindow = setInterval(() => {
        if (authWindow.closed) {
          setIsConnectingHubSpot(false);
          setAuthWindow(null);
          clearInterval(checkWindow);
        }
      }, 500);

      return () => clearInterval(checkWindow);
    }
  }, [authWindow]);

  const handleMicrosoftAuth = () => {
    try {
      setIsConnectingMicrosoft(true);
      const authClient = new MicrosoftAuthClient();
      const popup = authClient.openAuthPopup();
      
      if (!popup) {
        setIsConnectingMicrosoft(false);
        toast({
          title: 'Popup Blocked',
          description: 'Please allow popups for this site and try again.',
          variant: 'destructive',
        });
        return;
      }

      setAuthWindow(popup);

    } catch (error) {
      console.error('Failed to initiate Microsoft auth:', error);
      setIsConnectingMicrosoft(false);
      toast({
        title: 'Authentication Error',
        description: 'Failed to connect to Microsoft',
        variant: 'destructive',
      });
    }
  };

  const handleHubSpotAuth = () => {
    try {
      setIsConnectingHubSpot(true);
      const authClient = new HubSpotAuthClient();
      const popup = authClient.openAuthPopup();
      
      if (!popup) {
        setIsConnectingHubSpot(false);
        toast({
          title: 'Popup Blocked',
          description: 'Please allow popups for this site and try again.',
          variant: 'destructive',
        });
        return;
      }

      setAuthWindow(popup);

    } catch (error) {
      console.error('Failed to initiate HubSpot auth:', error);
      setIsConnectingHubSpot(false);
      toast({
        title: 'Authentication Error',
        description: 'Failed to connect to HubSpot',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Integrations</h1>
      
      <div className="space-y-6">
        {/* Microsoft Integration Card */}
        <Card className="max-w-2xl">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Image
                src="/integrations/microsoft.png"
                alt="Microsoft"
                width={32}
                height={32}
              />
              <div>
                <h2 className="text-lg font-semibold">Microsoft Integration</h2>
                <p className="text-sm text-muted-foreground">Connect your Microsoft account</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleMicrosoftAuth}
              disabled={isConnectingMicrosoft}
            >
              {isConnectingMicrosoft ? 'Connecting...' : 'Connect Microsoft Account'}
            </Button>
          </CardContent>
        </Card>

        {/* HubSpot Integration Card */}
        <Card className="max-w-2xl">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Image
                src="/integrations/hubspot.png"
                alt="HubSpot"
                width={32}
                height={32}
              />
              <div>
                <h2 className="text-lg font-semibold">HubSpot Integration</h2>
                <p className="text-sm text-muted-foreground">Connect your HubSpot CRM</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleHubSpotAuth}
              disabled={isConnectingHubSpot}
            >
              {isConnectingHubSpot ? 'Connecting...' : 'Connect HubSpot Account'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}