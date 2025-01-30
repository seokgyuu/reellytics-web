import { NextAuthOptions, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";

// JWT 확장 타입 정의
interface ExtendedJWT extends JWT {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpires?: number;
  error?: string;
  idToken?: string;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

// 세션 확장 타입 정의
declare module "next-auth" {
  interface Session {
    idToken?: string;  // idToken 추가
    accessToken?: string;
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

async function session({
  session,
  token,
}: {
  session: Session;
  token: ExtendedJWT;
}) {
  session.user = token.user;
  session.accessToken = token.accessToken;
  session.idToken = token.idToken;  // idToken 할당
  session.error = token.error;
  return session;
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user, account }) => {
      const extendedToken = token as ExtendedJWT;

      if (user && account) {
        return {
          ...extendedToken,
          accessToken: account.access_token,
          idToken: account.id_token,  // idToken 저장
          refreshToken: account.refresh_token,
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

      if (extendedToken.refreshToken) {
        try {
          const response = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              client_id: process.env.GOOGLE_CLIENT_ID!,
              client_secret: process.env.GOOGLE_CLIENT_SECRET!,
              refresh_token: extendedToken.refreshToken,
              grant_type: "refresh_token",
            }),
          });

          const refreshedTokens = await response.json();

          if (!response.ok) throw refreshedTokens;

          return {
            ...extendedToken,
            accessToken: refreshedTokens.access_token,
            idToken: refreshedTokens.id_token || extendedToken.idToken,
            accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
            refreshToken: refreshedTokens.refresh_token || extendedToken.refreshToken,
          };
        } catch (error) {
          console.error("리프레시 토큰 갱신 실패:", error);
          return { ...extendedToken, error: "RefreshAccessTokenError" };
        }
      }

      return { ...extendedToken, error: "RefreshTokenMissing" };
    },
    session,
  },
};
