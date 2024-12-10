import { NextResponse } from 'next/server';

// Load environment variables for Microsoft OAuth configuration
const CLIENT_ID = process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID;
const CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET;
const AUTHORITY = process.env.MICROSOFT_AUTHORITY || 'https://login.microsoftonline.com/common';

// Type definitions for better type safety
interface TokenRequestBody {
  code: string;
  redirect_uri: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  id_token: string;
}

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body: TokenRequestBody = await request.json();
    console.log('Receiving token request with code');

    // Validate required fields
    if (!body.code || !body.redirect_uri) {
      return NextResponse.json({
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Validate environment variables
    if (!CLIENT_ID || !CLIENT_SECRET) {
      console.error('Missing required environment variables');
      return NextResponse.json({
        error: 'Configuration error',
        detail: 'Missing required OAuth credentials'
      }, { status: 500 });
    }

    // Build token request
    const tokenEndpoint = `${AUTHORITY}/oauth2/v2.0/token`;
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code: body.code,
      redirect_uri: body.redirect_uri,
      grant_type: 'authorization_code',
      scope: [
        'https://graph.microsoft.com/User.Read',
        'https://graph.microsoft.com/Mail.Send',
        'https://graph.microsoft.com/Mail.Read',
        'offline_access'
      ].join(' ')
    });

    // Make token request
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: params.toString()
    });

    // Handle error responses
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Token endpoint error:', errorData);
      return NextResponse.json({
        error: 'Token endpoint error',
        detail: errorData
      }, { status: response.status });
    }

    // Parse and validate token response
    const data: TokenResponse = await response.json();

    // Log token status (but not the actual tokens)
    console.log('Access Token:', data.access_token ? 'Present' : 'Missing');
    console.log('Refresh Token:', data.refresh_token ? 'Present' : 'Missing');

    // Return formatted response
    return NextResponse.json({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresOn: new Date(Date.now() + (data.expires_in * 1000)).toISOString(),
      idToken: data.id_token
    });

  } catch (error: any) {
    // Handle any unexpected errors
    console.error('Token acquisition error:', error);
    return NextResponse.json({
      error: 'Failed to acquire token',
      detail: error.message
    }, { status: 500 });
  }
}