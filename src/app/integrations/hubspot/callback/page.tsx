'use client';

import React, { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { hubspotService } from '@/services/hubspotService';
import { TokenStoreRequest } from '@/types/integrations.hubspot';

const HubSpotCallback: React.FC = () => {
  const searchParams = useSearchParams();
  const hasProcessed = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      // Prevent double processing
      if (hasProcessed.current) return;
      hasProcessed.current = true;

      const code = searchParams.get('code');
      const error = searchParams.get('error');
      
      console.log('Processing callback with code:', code);

      if (error) {
        console.error('HubSpot auth error:', error);
        if (window.opener) {
          window.opener.postMessage({
            type: 'HUBSPOT_AUTH_CALLBACK',
            success: false,
            error: error
          }, window.location.origin);
        }
        return;
      }

      if (!code) {
        console.error('No authorization code received');
        if (window.opener) {
          window.opener.postMessage({
            type: 'HUBSPOT_AUTH_CALLBACK',
            success: false,
            error: 'No authorization code received'
          }, window.location.origin);
        }
        return;
      }

      try {
        console.log('Making request to token endpoint...');
        
        const tokenResponse = await fetch('/api/integrations/hubspot/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            code,
            redirect_uri: window.location.origin + '/integrations/hubspot/callback'
          })
        });

        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.text();
          console.error('Token exchange failed:', errorData);
          throw new Error('Failed to exchange code for tokens');
        }

        const tokens = await tokenResponse.json();
        console.log('Token exchange successful');

        // Store tokens using our service
        const tokenRequest: TokenStoreRequest = {
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
          token_type: tokens.token_type || 'Bearer',
          expires_in: tokens.expiresIn,
          scopes: [
            'crm.objects.contacts.write',
            'crm.objects.contacts.read',
            'crm.objects.deals.read',
            'crm.objects.deals.write',
            'oauth'
          ]
        };

        await hubspotService.storeTokens(tokenRequest);

        // Send success message to parent window
        if (window.opener) {
          window.opener.postMessage({
            type: 'HUBSPOT_AUTH_CALLBACK',
            success: true,
            data: tokens
          }, window.location.origin);
        }

      } catch (error) {
        console.error('Error in HubSpot callback:', error);
        if (window.opener) {
          window.opener.postMessage({
            type: 'HUBSPOT_AUTH_CALLBACK',
            success: false,
            error: error instanceof Error ? error.message : 'Failed to exchange code for tokens'
          }, window.location.origin);
        }
      }

      // Add a small delay before closing to ensure message is sent
      setTimeout(() => {
        if (window.opener) {
          window.close();
        }
      }, 1000);
    };

    handleCallback();
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Connecting to HubSpot...</h2>
        <p className="text-gray-600">This window will close automatically once connected.</p>
      </div>
    </div>
  );
};

export default HubSpotCallback;