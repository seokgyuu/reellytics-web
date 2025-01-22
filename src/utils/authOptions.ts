import { NextAuthOptions, Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import KeycloakProvider from 'next-auth/providers/keycloak';

interface ExtendedJWT extends JWT {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpires?: number;
  error?: string;
  id_token?: string;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }; 
}

export interface NextAuthSession extends Session {
  accessToken?: string;
  error?: string;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }; 
}

// session 콜백에서 undefined 값을 기본 처리
async function session({ session, token }: { session: NextAuthSession; token: ExtendedJWT }) {
  session.user = token.user; // undefined 처리
  session.accessToken = token.accessToken;
  session.error = token.error;
  return session;
}

// NextAuth 설정
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
    jwt: async ({ token, user, account }) => {
      const extendedToken = token as ExtendedJWT;
      if (user && account) {
        return {
          ...extendedToken,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: Date.now() + (account.expires_at ?? 0) * 1000,
          id_token: account.id_token,
          user,
        };
      }

      if (extendedToken.accessTokenExpires && Date.now() < extendedToken.accessTokenExpires) {
        return extendedToken;
      }

      return extendedToken;
    },
    session,
  },
};
