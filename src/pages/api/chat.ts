import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { query, session_id, access_token, name } = req.body;

    if (!access_token) {
      return res.status(401).json({ error: "Access token is missing" });
    }

    let responseText: string;

    switch (query.toLowerCase()) {
      case "안녕하세요":
      case "hello":
        responseText = `안녕하세요 ${name || "사용자"}님! 무엇을 도와드릴까요?`;
        break;
      case "내 이름이 뭐야":
        responseText = `당신의 이름은 ${name || "알 수 없음"}입니다.`;
        break;
      case "날씨 어때?":
        responseText = "오늘은 맑은 날씨입니다! 좋은 하루 보내세요.";
        break;
      default:
        responseText = "죄송해요, 아직 그 질문에 대한 답변은 준비되지 않았어요.";
    }

    return res.status(200).json({
      response: responseText, 
      session_id: session_id,
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
