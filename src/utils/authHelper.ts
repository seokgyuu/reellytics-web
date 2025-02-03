import User from '@/models/User';
import { connectToDatabase } from '@/utils/mongodb';

/**
 * @param email 사용자 이메일
 * @param accessToken Keycloak에서 발급된 액세스 토큰
 * @param refreshToken Keycloak에서 발급된 리프레시 토큰
 * @param expiresAt 토큰 만료 시간
 */
export async function storeKeycloakToken(email: string, accessToken: string, refreshToken: string, expiresAt: number) {
  await connectToDatabase();

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // 사용자 정보 업데이트
      existingUser.keycloakTokens = {
        accessToken,
        refreshToken,
        expiresAt: Date.now() + expiresAt * 1000,
      };
      await existingUser.save();
      console.log('사용자 토큰 정보 업데이트 성공:', email);
    } else {
      // 새로운 사용자 저장
      await User.create({
        email,
        keycloakTokens: {
          accessToken,
          refreshToken,
          expiresAt: Date.now() + expiresAt * 1000,
        },
      });
      console.log('새로운 사용자 토큰 정보 저장 성공:', email);
    }
  } catch (error) {
    console.error('사용자 토큰 저장 중 오류 발생:', error);
  }
}
