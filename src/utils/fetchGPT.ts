export async function fetchGPT(prompt: string): Promise<string> {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY; // 환경 변수로 API 키 관리
    const endpoint = "https://api.openai.com/v1/chat/completions";
  
    const payload = {
      model: "gpt-3.5-turbo", // GPT 모델
      messages: [{ role: "user", content: prompt }], // 사용자 메시지
    };
  
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
  
      const data = await response.json();
      return data.choices[0].message.content; // GPT 응답 반환
    } catch (error) {
      console.error("Error fetching GPT response:", error);
      return "An error occurred while fetching the response.";
    }
  }
  