
export default async function fetchWithToken(
  url: string,
  accessToken: string | null,
  init?: RequestInit
) {
  if (!accessToken) {
    throw new Error('유효한 액세스 토큰이 없습니다.');
  }

  try {
    const response = await fetch(url, {
      ...init,
      headers: {
        ...init?.headers,
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API 요청 중 오류 발생:', error);
    throw new Error('API 요청 중 문제가 발생했습니다.');
  }
}
