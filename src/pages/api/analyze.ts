import { NextApiRequest, NextApiResponse } from 'next';
import { validateAccessToken } from '@/middleware/authMiddleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await validateAccessToken(req, res, async () => {
    try {
      // 토큰 검증 성공 후 API 로직 실행
      const { followers, views, likes } = req.body;

      // 예제 API 응답
      return res.status(200).json({
        status: 'success',
        result: `팔로워: ${followers}, 조회수: ${views}, 좋아요: ${likes}`,
      });
    } catch (error) {
      console.error('API 처리 중 오류 발생:', error);
      return res.status(500).json({ message: '서버 오류' });
    }
  });
}
