import { NextAuthOptions, Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import KeycloakProvider from 'next-auth/providers/keycloak';
import GoogleProvider from 'next-auth/providers/google';

// JWT 확장 타입 정의
interface ExtendedJWT extends JWT {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpires?: number;
  error?: string;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

// 세션 확장 타입 정의
export interface NextAuthSession extends Session {
  accessToken?: string;
  error?: string;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

// 세션 콜백
async function session({ session, token }: { session: NextAuthSession; token: ExtendedJWT }) {
  session.user = token.user;
  session.accessToken = token.accessToken;
  session.error = token.error;
  return session;
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_ID as string,
      clientSecret: process.env.KEYCLOAK_SECRET as string,
      issuer: process.env.KEYCLOAK_ISSUER,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    jwt: async ({ token, user, account }) => {
      const extendedToken = token as ExtendedJWT;

      if (user && account) {
        return {
          ...extendedToken,
          accessToken: account.access_token as string,
          refreshToken: account.refresh_token as string,
          accessTokenExpires: Date.now() + (account.expires_at ?? 0) * 1000,
          user: {
            name: user.name || null,
            email: user.email || null,
            image: user.image || null,
          },
        };
      }

      if (extendedToken.accessTokenExpires && Date.now() < extendedToken.accessTokenExpires) {
        return extendedToken;
      }

      return {
        ...extendedToken,
        error: 'AccessTokenExpired',
      };
    },
    session,
  },
};
