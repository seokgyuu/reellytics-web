import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';

// 확장된 세션 타입 정의
interface NextAuthSession {
  accessToken?: string;
  error?: string;
}

async function fetchWithToken(url: string, init?: { headers?: {} }) {
  try {
    const session = (await getServerSession(authOptions)) as NextAuthSession | null;

    if (!session || !session.accessToken) {
      throw new Error('No active session or missing access token');
    }

    const commonHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.accessToken}`,
    };

    const response = await fetch(url, {
      ...init,
      headers: {
        ...init?.headers,
        ...commonHeaders,
      },
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    return response.json();
  } catch (e) {
    console.error('Fetch with token failed:', e);
    return { error: 'Failed to fetch data' };
  }
}

export default fetchWithToken;
