'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { microsoftService } from '@/services/microsoftService';
import { TokenStoreRequest, UserData } from '@/types/integrations.microsoft';

interface MicrosoftGraphUser {
  id: string;
  displayName: string;
  givenName?: string;
  surname?: string;
  mail: string;
  userPrincipalName: string;
  preferredLanguage?: string;
  jobTitle?: string | null;
  mobilePhone?: string | null;
  officeLocation?: string | null;
}

export default function CallbackPage() {
  const searchParams = useSearchParams();
  const requestMade = useRef(false);

  useEffect(() => {
    async function handleCallback() {
      if (requestMade.current) return;

      const code = searchParams.get('code');
      if (!code) {
        if (window.opener) {
          window.opener.postMessage({
            type: 'MICROSOFT_AUTH_CALLBACK',
            success: false,
            error: 'No authorization code received'
          }, window.location.origin);
          window.close();
        }
        return;
      }

      try {
        requestMade.current = true;

        // Exchange code for tokens
        const response = await fetch('/api/integrations/microsoft/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            redirect_uri: process.env.NEXT_PUBLIC_MICROSOFT_REDIRECT_URI
          })
        });

        if (!response.ok) throw new Error('Token request failed');
        const data = await response.json();

        // Get user data using Graph API
        const graphResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
          headers: {
            'Authorization': `Bearer ${data.accessToken}`,
          }
        });

        if (!graphResponse.ok) throw new Error('Failed to get user info');
        const graphUser: MicrosoftGraphUser = await graphResponse.json();

        // Transform user data
        const transformedUserData: UserData = {
          id: graphUser.id,
          display_name: graphUser.displayName,
          user_principal_name: graphUser.userPrincipalName,
          given_name: graphUser.givenName,
          surname: graphUser.surname,
          preferred_language: graphUser.preferredLanguage,
          job_title: graphUser.jobTitle ?? null,
          mobile_phone: graphUser.mobilePhone ?? null,
          office_location: graphUser.officeLocation ?? null
        };

        const tokenRequest: TokenStoreRequest = {
          access_token: data.accessToken,
          refresh_token: data.refreshToken,
          email: graphUser.userPrincipalName,
          expires_in: 3600,
          scopes: ['https://graph.microsoft.com/User.Read', 'offline_access', 'https://graph.microsoft.com/Mail.Send', 'https://graph.microsoft.com/Mail.Read'],
          user_data: transformedUserData
        };

        await microsoftService.storeTokens(tokenRequest);

        // Notify parent window of success
        if (window.opener) {
          window.opener.postMessage({
            type: 'MICROSOFT_AUTH_CALLBACK',
            success: true,
            data: transformedUserData
          }, window.location.origin);
          window.close();
        }
      } catch (error) {
        console.error('Error:', error);
        if (window.opener) {
          window.opener.postMessage({
            type: 'MICROSOFT_AUTH_CALLBACK',
            success: false,
            error: error instanceof Error ? error.message : 'Authentication failed'
          }, window.location.origin);
          window.close();
        }
      }
    }

    handleCallback();
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <h2>Connecting to Microsoft...</h2>
      <p className="text-gray-600">This window will close automatically.</p>
    </div>
  );
}