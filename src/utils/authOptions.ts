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
  session.user = token.user;
  session.accessToken = token.accessToken;
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
          access_type: "offline", // 리프레시 토큰 발급
          prompt:"consent", // 강제로그인으로 우선 해결해둠
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

      return {
        ...extendedToken,
        accessToken: null,
        refreshToken: null,
        user: null,
        accessTokenExpires: null,
        error: "AccessTokenExpired",
      };
    },
    session,
  },
};
