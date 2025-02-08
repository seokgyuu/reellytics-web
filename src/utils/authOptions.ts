import { NextAuthOptions, Session } from 'next-auth';
import KeycloakProvider from 'next-auth/providers/keycloak';
import { refreshAccessToken } from './refreshAccessToken';
import { doFinalSignoutHandshake } from './logoutHelper';
import { User } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    error?: string;
  }
  interface JWT {
    accessToken?: string;
    accessTokenExpires?: number;
    refreshToken?: string;
    error?: string;
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_ID || '',
      clientSecret: process.env.KEYCLOAK_SECRET || '',
      issuer: process.env.KEYCLOAK_ISSUER || '',
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user && account && account.expires_at) {
        return {
          accessToken: account.access_token || '',
          accessTokenExpires: Date.now() + account.expires_at * 1000,
          refreshToken: account.refresh_token || '',
          user,
        };
      }

      if (typeof token.accessTokenExpires === 'number' && Date.now() > token.accessTokenExpires) {
        return refreshAccessToken(token);
      }

      return token;
    },
    async session({ session, token }) {
      session.user = token.user as User;  // 타입 단언으로 수정
      session.accessToken = token.accessToken as string | undefined;
      session.error = token.error as string | undefined;
      return session;
    },
  },
  events: {
    signOut: (message) => doFinalSignoutHandshake(message.token),
  },
};
