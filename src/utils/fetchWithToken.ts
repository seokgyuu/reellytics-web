import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { NextAuthSession } from '@/types/next-auth';

// API 요청을 인증된 세션 기반으로 수행하는 함수
async function fetchWithToken(url: string, init?: { headers?: {} }) {
  try {
    let session = (await getServerSession(authOptions)) as NextAuthSession | null;

    if (!session || !session.accessToken) {
      throw new Error('유효한 액세스 토큰이 없습니다.');
    }

    let response = await fetch(url, {
      ...init,
      headers: {
        ...init?.headers,
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      console.warn('액세스 토큰이 만료됨. 토큰 갱신 시도 중...');
      await refreshToken();  // 리프레시 토큰을 사용하여 갱신

      session = (await getServerSession(authOptions)) as NextAuthSession | null;
      if (!session || !session.accessToken) {
        throw new Error('토큰 갱신 실패');
      }

      response = await fetch(url, {
        ...init,
        headers: {
          ...init?.headers,
          Authorization: `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
      });
    }

    if (!response.ok) {
      throw new Error('네트워크 요청 실패');
    }

    return response.json();
  } catch (error) {
    console.error('API 호출 중 오류:', error);
    return null;
  }
}

// 액세스 토큰이 만료된 경우 리프레시 토큰을 사용하여 갱신하는 함수
async function refreshToken() {
  try {
    const session = (await getServerSession(authOptions)) as NextAuthSession | null; 

    if (!session || !session.refreshToken) {
      throw new Error('리프레시 토큰이 없습니다.');
    }

    const response = await fetch(`${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: process.env.KEYCLOAK_ID!,
        client_secret: process.env.KEYCLOAK_SECRET!,
        refresh_token: session.refreshToken,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw new Error('리프레시 토큰을 사용한 갱신 실패');
    }

    console.log('토큰 갱신 성공');
    return refreshedTokens;
  } catch (error) {
    console.error(' 토큰 갱신 오류:', error);
  }
}

export default fetchWithToken;
