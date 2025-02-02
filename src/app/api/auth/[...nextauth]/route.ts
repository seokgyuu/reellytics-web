import NextAuth, { NextAuthOptions, Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import KeycloakProvider from 'next-auth/providers/keycloak';
import GoogleProvider from 'next-auth/providers/google';
import { storeKeycloakToken } from '@/utils/authHelper';  // MongoDB에 저장하는 헬퍼 함수

async function refreshAccessToken(token: JWT) {
  try {
    const url = `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`;
    const body = {
      grant_type: 'refresh_token',
      client_id: process.env.KEYCLOAK_ID as string,
      client_secret: process.env.KEYCLOAK_SECRET as string,
      refresh_token: token.refreshToken as string,
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
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error('토큰 갱신 중 오류 발생:', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

async function doFinalSignoutHandshake(jwt: JWT) {
  const { id_token } = jwt;

  try {
    const params = new URLSearchParams();
    params.append('id_token_hint', String(id_token));
    const { status, statusText } = await fetch(
      `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/logout?${params.toString()}`
    );

    console.log('Completed post-logout handshake', status, statusText);
  } catch (e: any) {
    console.error('Unable to perform post-logout handshake:', e?.code || e);
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_ID!,
      clientSecret: process.env.KEYCLOAK_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async jwt({ token, user, account, profile }) {
      // Google 또는 Keycloak 로그인 성공 시
      if (account && user) {
        const keycloakAccessToken = account.access_token as string;
        const keycloakRefreshToken = account.refresh_token as string;

        try {
          // MongoDB에 사용자 토큰 저장
          await storeKeycloakToken(user.email as string, keycloakAccessToken, keycloakRefreshToken, account.expires_at!);
        } catch (error) {
          console.error('MongoDB에 토큰 저장 중 오류 발생:', error);
        }

        return {
          accessToken: keycloakAccessToken,
          accessTokenExpires: Date.now() + account.expires_at! * 1000,
          refreshToken: keycloakRefreshToken,
          id_token: account.id_token,
          user,
        };
      }

      // 액세스 토큰이 아직 유효하면 기존 토큰을 반환
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // 액세스 토큰이 만료된 경우 갱신
      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      if (token) {
        session.user = token.user as {
          name?: string | null;
          email?: string | null;
          image?: string | null;
        };
        session.accessToken = token.accessToken as string;
        session.error = token.error as string | undefined;
      }
      return session;
    },
  },

  events: {
    signOut: message => doFinalSignoutHandshake(message.token),
  },
};

interface NextAuthSessionProps {
  session: NextAuthSession;
  token: JWT;
}

export interface NextAuthSession extends Session {
  accessToken?: string | undefined;
  error?: string | undefined;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
