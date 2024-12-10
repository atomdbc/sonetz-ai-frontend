// src/components/integrations/IntegrationCard.tsx
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { IntegrationProvider } from '@/lib/integrations/types';

interface IntegrationCardProps {
  provider: IntegrationProvider;
  onConnect: () => void;
  isConnecting: boolean;
}

export function IntegrationCard({ provider, onConnect, isConnecting }: IntegrationCardProps) {
  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Image
            src={provider.logo}
            alt={provider.name}
            width={32}
            height={32}
          />
          <div>
            <h2 className="text-lg font-semibold">{provider.name} Integration</h2>
            <p className="text-sm text-muted-foreground">{provider.description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Button
          onClick={onConnect}
          disabled={isConnecting}
        >
          {isConnecting ? 'Connecting...' : `Connect ${provider.name} Account`}
        </Button>
      </CardContent>
    </Card>
  );
}