// src/app/api/integrations/auth/route.ts

import { NextRequest, NextResponse } from 'next/server';

const INTEGRATION_CONFIGS = {
  hubspot: {
    authUrl: 'https://app.hubspot.com/oauth/authorize',
    tokenUrl: 'https://api.hubapi.com/oauth/v1/token',
    clientId: process.env.HUBSPOT_CLIENT_ID,
    clientSecret: process.env.HUBSPOT_CLIENT_SECRET,
    scopes: 'contacts timeline',
  },
  // Add other integrations here with their configs
} as const;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const integration = searchParams.get('integration');

  if (!integration || !(integration in INTEGRATION_CONFIGS)) {
    return NextResponse.json(
      { error: 'Invalid integration' },
      { status: 400 }
    );
  }

  const config = INTEGRATION_CONFIGS[integration as keyof typeof INTEGRATION_CONFIGS];
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/callback?integration=${integration}`;

  const authUrl = new URL(config.authUrl);
  authUrl.searchParams.set('client_id', config.clientId!);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', config.scopes);
  authUrl.searchParams.set('response_type', 'code');

  return NextResponse.json({ authUrl: authUrl.toString() });
}