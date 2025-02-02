import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/utils/mongodb';

export async function validateAccessToken(req: NextApiRequest, res: NextApiResponse, next: () => void) {
  const authorizationHeader = req.headers['authorization'];
  
  if (!authorizationHeader) {
    return res.status(401).json({ message: 'Authorization 헤더가 없습니다.' });
  }

  try {
    const token = authorizationHeader;
    const client = await clientPromise;
    const db = client.db('reellytics');
    const collection = db.collection('userTokens');

    // MongoDB에서 토큰 검증
    const user = await collection.findOne({ keycloakAccessToken: token });

    if (!user) {
      return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
    }

    // 토큰 만료 검증
    if (Date.now() > user.expiresAt) {
      return res.status(401).json({ message: '토큰이 만료되었습니다.' });
    }

    next();  // 인증 성공 시 다음 핸들러로 이동
  } catch (error) {
    console.error('토큰 검증 중 오류 발생:', error);
    return res.status(500).json({ message: '서버 오류' });
  }
}
