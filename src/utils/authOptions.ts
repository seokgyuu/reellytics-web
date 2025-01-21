import { NextAuthOptions } from 'next-auth';
import KeycloakProvider from 'next-auth/providers/keycloak';
import { JWT } from 'next-auth/jwt';

async function refreshAccessToken(token: JWT): Promise<JWT> {
    try {
      const url = `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`;
  
      if (typeof token.refreshToken !== 'string') {
        throw new Error('Invalid refresh token');
      }
  
      const body = {
        grant_type: 'refresh_token',
        client_id: process.env.KEYCLOAK_ID as string,
        client_secret: process.env.KEYCLOAK_SECRET as string,
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
  
      if (!response.ok) throw refreshedTokens;
  
      return {
        ...token,
        accessToken: refreshedTokens.access_token,
        refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
        accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      };
    } catch (error) {
      console.error('Error refreshing access token:', error);
  
      return {
        ...token,
        error: 'RefreshAccessTokenError',
      };
    }
  }
  

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_ID as string,
      clientSecret: process.env.KEYCLOAK_SECRET as string,
      issuer: process.env.KEYCLOAK_ISSUER,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user && account) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: Date.now() + account.expires_at! * 1000,
          id_token: account.id_token,
          user,
        };
      }

      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.error = token.error as string;
      session.user = token.user as {
        name?: string | null;
        email?: string | null;
        image?: string | null;
      };
      return session;
    },
  },
};
