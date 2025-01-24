import { authOptions } from '@/utils/authOptions';
import { getServerSession } from 'next-auth';

async function fetchWithToken(url: string, init?: RequestInit) {
  try {
    const session = await getServerSession(authOptions);

    const commonHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.accessToken}`,
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
  } catch (error) {
    console.error('API 요청 중 오류 발생:', error);
    return 'Logout status';
  }
}

export default fetchWithToken;
