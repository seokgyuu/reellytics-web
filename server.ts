import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import axios from "axios";
import dotenv from "dotenv";

// 환경 변수 로드
dotenv.config();

const app = express();
const PORT = 5000;

// 요청 본문 타입 정의
interface ChatRequestBody {
  query: string;
  session_id: string;
}

// OpenAI 응답 타입 정의
interface OpenAIResponse {
  choices: { message: { content: string } }[];
}

// 미들웨어 설정
app.use(cors());
app.use(bodyParser.json());

// OpenAI API 키 로드
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY가 설정되지 않았습니다. .env 파일을 확인하세요.");
}

// POST /chat 엔드포인트
app.post("/chat", async (req: Request<{}, {}, ChatRequestBody>, res: Response) => {
  const { query, session_id } = req.body;

  console.log(`Received message: ${query}, Session ID: ${session_id}`);

  try {
    // OpenAI API 호출
    const response = await axios.post<OpenAIResponse>(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: query }],
        max_tokens: 150,
        temperature: 0.9,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // AI 응답 처리
    const aiResponse =
      response.data.choices[0]?.message.content.trim() || "응답이 없습니다.";
    res.json({ response: aiResponse });
  } catch (error: any) {
    console.error("OpenAI API 호출 중 오류:", error?.response?.data || error);
    res.status(500).json({ response: "서버에 문제가 발생했습니다." });
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
