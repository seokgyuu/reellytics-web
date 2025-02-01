import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { query, followers, elapsed_time, video_length, avg_watch_time, views, likes, comments, shares, saves, follows } = req.body;

  if (!query) {
    return res.status(400).json({ error: "Query 값이 필요합니다." });
  }

  console.log("수신된 데이터:", {
    query,
    followers,
    elapsed_time,
    video_length,
    avg_watch_time,
    views,
    likes,
    comments,
    shares,
    saves,
    follows,
  });

  res.status(200).json({
    result: `입력한 질문: ${query}\n분석 데이터를 성공적으로 처리했습니다.`,
  });
}
