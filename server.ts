import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import axios from "axios";
import dotenv from "dotenv";

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

// 환경 변수에서 API 키 가져오기
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// POST /chat 엔드포인트
app.post(
  "/chat",
  async (req: Request<{}, {}, ChatRequestBody>, res: Response) => {
    const { query, session_id } = req.body;
    console.log(`Received message: ${query}, session_id: ${session_id}`);

    try {
      // OpenAI API 호출
      const response = await axios.post<OpenAIResponse>(
        "",
        {
          model: "",
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

      // 응답 처리
      const aiResponse =
        response.data.choices[0]?.message.content.trim() || "응답이 없습니다.";
      res.json({ response: aiResponse });
    } catch (error: any) {
      console.error("Error calling OpenAI API:", error);
      res.status(500).json({ response: "서버에 문제가 발생했습니다." });
    }
  }
);

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
