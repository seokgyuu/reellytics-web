import { JWT } from 'next-auth/jwt';

export async function refreshAccessToken(token: JWT) {
  try {
    if (typeof token.refreshToken !== 'string' || !token.refreshToken) {
      throw new Error('Refresh token is missing or invalid');
    }

    const url = `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`;

    const body = {
      grant_type: 'refresh_token',
      client_id: process.env.KEYCLOAK_ID || '',
      client_secret: process.env.KEYCLOAK_SECRET || '',
      refresh_token: token.refreshToken,
    };

    const urlencoded = new URLSearchParams(body);

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
      body: urlencoded,
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw new Error(`Failed to refresh access token: ${refreshedTokens.error}`);
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token || token.refreshToken,
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}
