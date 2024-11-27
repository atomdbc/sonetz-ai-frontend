// src/app/api/integrations/callback/route.ts

import { NextRequest, NextResponse } from 'next/server';

const INTEGRATION_CONFIGS = {
  hubspot: {
    tokenUrl: 'https://api.hubapi.com/oauth/v1/token',
    clientId: process.env.HUBSPOT_CLIENT_ID,
    clientSecret: process.env.HUBSPOT_CLIENT_SECRET,
  },
  // Other integrations will be added here
} as const;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const integration = searchParams.get('integration');
  const code = searchParams.get('code');

  if (!integration || !(integration in INTEGRATION_CONFIGS)) {
    return NextResponse.json(
      { error: 'Invalid integration' },
      { status: 400 }
    );
  }

  if (!code) {
    return NextResponse.json(
      { error: 'Authorization code is required' },
      { status: 400 }
    );
  }

  const config = INTEGRATION_CONFIGS[integration as keyof typeof INTEGRATION_CONFIGS];
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/callback?integration=${integration}`;

  try {
    const tokenResponse = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: config.clientId!,
        client_secret: config.clientSecret!,
        redirect_uri: redirectUri,
        code: code,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens = await tokenResponse.json();

    // Here you would store the tokens securely
    // We can create a saveIntegrationTokens function that handles all integrations
    await saveIntegrationTokens(integration, tokens);

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/integrations?status=success&integration=${integration}`
    );
  } catch (error) {
    console.error(`${integration} callback error:`, error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/integrations?status=error&integration=${integration}`
    );
  }
}

async function saveIntegrationTokens(integration: string, tokens: any) {
  // Implement token storage logic here
  // This could be in your database, secure key storage, etc.
}