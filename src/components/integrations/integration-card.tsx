// src/components/integrations/integration-card.tsx

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import type { Integration } from './integrations-data';
import { integrationService } from '@/services/integrationService';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface IntegrationCardProps {
  integration: Integration;
}

export function IntegrationCard({ integration }: IntegrationCardProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      const authUrl = await integrationService.initiateAuth(integration.id);
      window.location.href = authUrl;
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description: `Unable to connect to ${integration.name}. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-lg border border-gray-200 bg-white hover:shadow-sm transition-all duration-200">
      <div className="flex items-start justify-between mb-6">
        <div className="w-16 h-16 relative">
          <Image
            src={integration.imagePath}
            alt={`${integration.name} logo`}
            width={64}
            height={64}
            className="object-contain"
            style={{
              maxWidth: '100%',
              height: 'auto'
            }}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className={
            integration.status === 'available'
              ? 'hover:bg-black hover:text-white border-black min-w-[100px]'
              : 'text-gray-600 bg-gray-50 min-w-[100px]'
          }
          disabled={integration.status !== 'available'}
          onClick={handleConnect}
          aria-label={`Connect to ${integration.name}`}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-t-black" />
              <span>Connecting...</span>
            </div>
          ) : (
            integration.status === 'available' ? 'Connect' : 'Coming soon'
          )}
        </Button>
      </div>
      <div className="space-y-2">
        <h3 className="text-black font-medium text-lg">{integration.name}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{integration.description}</p>
      </div>
    </div>
  );
}