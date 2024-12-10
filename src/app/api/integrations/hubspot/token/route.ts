// src/app/api/integrations/hubspot/token/route.ts
import { NextResponse } from 'next/server';

const CLIENT_ID = process.env.NEXT_PUBLIC_HUBSPOT_CLIENT_ID;
const CLIENT_SECRET = process.env.HUBSPOT_CLIENT_SECRET;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Receiving HubSpot token request with code');

    if (!body.code || !body.redirect_uri) {
      return NextResponse.json({ 
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Build token request
    const tokenEndpoint = 'https://api.hubapi.com/oauth/v1/token';
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: CLIENT_ID!,
      client_secret: CLIENT_SECRET!,
      redirect_uri: body.redirect_uri,
      code: body.code
    });

    // Make token request
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('HubSpot token endpoint error:', errorData);
      throw new Error('Token endpoint error');
    }

    const data = await response.json();
    
    // Log tokens received (for development only)
    console.log('Access Token:', data.access_token ? 'Present' : 'Missing');
    console.log('Refresh Token:', data.refresh_token ? 'Present' : 'Missing');
    console.log('Token response:', data);

    return NextResponse.json({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in
    });

  } catch (error: any) {
    console.error('HubSpot token acquisition error:', error);
    return NextResponse.json({ 
      error: 'Failed to acquire token',
      detail: error.message
    }, { status: 500 });
  }
}