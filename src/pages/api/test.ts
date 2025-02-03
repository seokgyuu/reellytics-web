import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/utils/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectToDatabase();
    res.status(200).json({ message: '✅ MongoDB 연결 성공!' });
  } catch (error) {
    res.status(500).json({ error: 'MongoDB 연결 실패', details: error });
  }
}
