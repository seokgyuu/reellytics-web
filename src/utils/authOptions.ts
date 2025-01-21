import { NextAuthOptions } from 'next-auth';
import KeycloakProvider from 'next-auth/providers/keycloak';
import { JWT } from 'next-auth/jwt';

async function refreshAccessToken(token: JWT): Promise<JWT> {
    try {
      const url = `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`;
  
      // refresh_token이 문자열이 아닌 경우 에러 처리
      if (typeof token.refreshToken !== 'string') {
        throw new Error('Invalid refresh token');
      }
  
      const body = {
        grant_type: 'refresh_token',
        client_id: process.env.KEYCLOAK_ID as string,
        client_secret: process.env.KEYCLOAK_SECRET as string,
        refresh_token: token.refreshToken, // 문자열로 보장
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
      // 초기 로그인 처리
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

      // Access Token이 만료되지 않은 경우
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Access Token 갱신
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
