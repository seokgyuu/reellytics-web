import NextAuth, { NextAuthOptions } from 'next-auth';
import KeycloakProvider from 'next-auth/providers/keycloak';
import { connectToDatabase } from '@/utils/mongodb';
import User from '@/models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_ID!,
      clientSecret: process.env.KEYCLOAK_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER!,
    }),
  ],

  callbacks: {
    async jwt({ token, account, user }) {
      if (account && user) {
        console.log('Keycloak에서 반환된 사용자 정보:', user);

        // MongoDB에 연결
        await connectToDatabase();

        try {
          const existingUser = await User.findOne({ email: user.email });

          if (!existingUser) {
            console.log('새로운 사용자 등록 시도:', user.email);
            const newUser = await User.create({
              name: user.name || '',
              email: user.email || '',
              image: user.image || '',
              keycloakTokens: {
                accessToken: account.access_token,
                refreshToken: account.refresh_token,
                expiresAt: Date.now() + (account.expires_at || 0) * 1000,
              },
            });
            console.log('새로운 사용자 저장 성공:', newUser.email);
          } else {
            console.log('기존 사용자 정보 업데이트:', existingUser.email);
            existingUser.keycloakTokens = {
              accessToken: account.access_token,
              refreshToken: account.refresh_token,
              expiresAt: Date.now() + (account.expires_at || 0) * 1000,
            };
            await existingUser.save();
          }

          token.accessToken = account.access_token;
          token.refreshToken = account.refresh_token;
          token.accessTokenExpires = Date.now() + (account.expires_at || 0) * 1000;
        } catch (error) {
          console.error('사용자 저장 중 오류 발생:', error);
        }
      }

      if (Date.now() < token.accessTokenExpires) {
        return token;
      }

      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.error = token.error;
      return session;
    },
  },
};

async function refreshAccessToken(token) {
  try {
    const response = await fetch(`${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: process.env.KEYCLOAK_ID!,
        client_secret: process.env.KEYCLOAK_SECRET!,
        refresh_token: token.refreshToken,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw new Error('토큰 갱신 요청 실패');
    }

    console.log('토큰 갱신 성공');
    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error('토큰 갱신 실패:', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}
