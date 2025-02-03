import axios from 'axios';

export async function refreshAccessToken(refreshToken: string): Promise<string> {
  try {
    console.log('AccessToken 갱신 요청 시작...');

    const response = await axios.post(
      `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`,
      new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: process.env.KEYCLOAK_ID!,
        client_secret: process.env.KEYCLOAK_SECRET!,
        refresh_token: refreshToken,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token, refresh_token: newRefreshToken } = response.data;

    // 새로 갱신된 토큰을 세션 스토리지에 저장
    sessionStorage.setItem('accessToken', access_token);
    sessionStorage.setItem('refreshToken', newRefreshToken);

    console.log('AccessToken 갱신 성공:', access_token);
    return access_token;
  } catch (error) {
    console.error('AccessToken 갱신 실패:', error);
    throw new Error('AccessToken 갱신 실패');
  }
}
