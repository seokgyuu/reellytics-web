import { NextAuthSession } from '@/types/next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';

async function fetchWithToken(url: string, init?: { headers?: {} }) {
  try {
    const session = (await getServerSession(authOptions)) as NextAuthSession | null;

    if (session === null) {
      return null;
    }

    const commonHeaders = {
      'Content-Type': 'application/json',
      Authorization: `${session.accessToken ?? ''}`, 
    };

    const response = await fetch(url, {
      ...init,
      headers: {
        ...init?.headers,
        ...commonHeaders,
      },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return response.json();
  } catch (e) {
    console.error('API 호출 중 오류 발생:', e);
    return 'Logout status';
  }
}

export default fetchWithToken;
