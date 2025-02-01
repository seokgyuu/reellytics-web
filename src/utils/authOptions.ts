import { NextAuthOptions, Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";

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
    idToken?: string;
    accessToken?: string;
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
    error?: string;
  }
}

// 세션 콜백 함수 정의
async function sessionCallback({
  session,
  token,
}: {
  session: Session;
  token: ExtendedJWT;
}) {
  session.user = token.user;
  session.accessToken = token.accessToken;
  session.idToken = token.idToken;
  session.error = token.error;
  return session;
}

// 액세스 토큰 갱신 함수
async function refreshAccessToken(token: ExtendedJWT) {
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: token.refreshToken!,
        grant_type: "refresh_token",
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw new Error(`Failed to refresh access token: ${JSON.stringify(refreshedTokens)}`);
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      idToken: refreshedTokens.id_token || token.idToken,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token || token.refreshToken,
    };
  } catch (error) {
    console.error("리프레시 토큰 갱신 실패:", error);
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

// NextAuth 설정
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
    // JWT 콜백에서 액세스 토큰 설정
    jwt: async ({ token, user, account }) => {
      let extendedToken = token as ExtendedJWT;

      if (user && account) {
        extendedToken = {
          accessToken: account.access_token,
          idToken: account.id_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: Date.now() + (account.expires_at ?? 3600) * 1000,
          user: {
            name: user.name || null,
            email: user.email || null,
            image: user.image || null,
          },
        };
      } else if (Date.now() < (extendedToken.accessTokenExpires || 0)) {
        return extendedToken;
      } else if (extendedToken.refreshToken) {
        extendedToken = await refreshAccessToken(extendedToken);
      }

      return extendedToken;
    },
    session: sessionCallback,
  },
  events: {
    async signOut({ token }) {
      console.log("사용자 로그아웃:", token);
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
};
