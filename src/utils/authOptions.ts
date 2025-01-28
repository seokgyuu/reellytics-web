import { NextAuthOptions, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
//import KeycloakProvider from "next-auth/providers/keycloak";
import GoogleProvider from "next-auth/providers/google";

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
async function session({
  session,
  token,
}: {
  session: NextAuthSession;
  token: ExtendedJWT;
}) {
  session.user = token.user; // 사용자 정보를 세션에 저장
  session.accessToken = token.accessToken; // JWT의 access token 저장
  session.error = token.error;
  return session;
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    // KeycloakProvider({
    //   clientId: process.env.KEYCLOAK_ID!,
    //   clientSecret: process.env.KEYCLOAK_SECRET!,
    //   issuer: process.env.KEYCLOAK_ISSUER,
    // }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization:{
        params:{
          access_type: "offline", // token 만료시 리프레시 토큰 생성
          prompt:"consent", // 강제로그인으로 우선 해결해둠
        },
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user, account }) => {
      const extendedToken = token as ExtendedJWT;

      if (user && account) {
        console.log("발급된 리프레시 토큰:", account.refresh_token);
        
        return {
          ...extendedToken,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: Date.now() + (account.expires_at ?? 0) * 1000,
          user: {
            name: user.name || null,
            email: user.email || null,
            image: user.image || null,
          },
        };
      }

      // 엑세스 토큰 만료 확인
    if (extendedToken.accessTokenExpires && Date.now() < extendedToken.accessTokenExpires) {
      return extendedToken; // 엑세스 토큰이 유효함
    }

    // 엑세스 토큰이 만료된 경우
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

        if (!response.ok) {
          throw refreshedTokens;
        }

        return {
          ...extendedToken,
          accessToken: refreshedTokens.access_token,
          accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
          refreshToken: refreshedTokens.refresh_token || extendedToken.refreshToken, // 새 리프레시 토큰이 없으면 기존 것을 사용
        };
      } catch (error) {
        console.error("리프레시 토큰 갱신 실패", error);
        return {
          ...extendedToken,
          error: "RefreshAccessTokenError",
        };
      }
    }

    return {
      ...extendedToken,
      error: "RefreshTokenMissing",
    };
  },
  session,
},
};