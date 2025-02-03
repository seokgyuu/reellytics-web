'use client';

import React, { useState, useEffect, useRef } from 'react';
import fetchWithToken from '@/utils/fetchWithToken';

interface ChatBotProps {
  accessToken: string | null;
}

interface AnalyzeResponse {
  status: number;
  result: string;
}

const ChatBot: React.FC<ChatBotProps> = ({ accessToken }) => {
  const chatLogRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [chatParams, setChatParams] = useState({
    followers: 0,
    elapsed_time: 0,
    video_length: 0,
    avg_watch_time: 0,
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    saves: 0,
    follows: 0,
    version: 1,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleParamsChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setChatParams((prev) => ({
      ...prev,
      [field]: Number(e.target.value),
    }));
  };

  const fetchGPTResponse = async (): Promise<string> => {
    try {
      const data = await fetchWithToken(
        `${process.env.NEXT_PUBLIC_API_URL}/analyze`,
        accessToken,
        {
          method: 'POST',
          body: JSON.stringify(chatParams),
        }
      );

      if (data.status === 200) {
        return data.result;
      } else {
        throw new Error(`API 응답 오류: status ${data.status}`);
      }
    } catch (error) {
      console.error('API 요청 오류:', error);
      return 'API 요청 중 오류가 발생했습니다.';
    }
  };

  const handleParamsSubmit = async () => {
    const paramMessage = Object.entries(chatParams)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    setMessages((prev) => [
      ...prev,
      { sender: '시스템', text: '파라미터가 설정되었습니다. 채팅을 시작할 수 있습니다.' },
      { sender: '사용자', text: paramMessage },
    ]);

    setIsLoading(true);
    try {
      const gptResponse = await fetchGPTResponse();
      setMessages((prev) => [...prev, { sender: 'AI', text: gptResponse }]);
    } catch (error) {
      setMessages((prev) => [...prev, { sender: '시스템', text: `오류 발생: ${error}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div id="Chatbot" className="absolute top-[100px] left-0 right-0 bottom-0 flex flex-col max-w-[1280px] h-[calc(100vh-100px)] bg-white overflow-hidden z-10 mx-auto sm:w-[95%]">
      <div id="chat-log" ref={chatLogRef} className="flex-grow overflow-y-auto p-4 text-sm leading-6 flex flex-col justify-start">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 rounded-2xl max-w-[80%] mb-2 whitespace-pre-wrap ${
              msg.sender === '사용자' ? 'bg-green-100 self-end' : 'bg-gray-200 self-start'
            }`}
          >
            {msg.text}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center justify-center">
            <div className="spinner"></div>
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-100 border-b">
        <h4 className="font-semibold mb-2">API 요청 파라미터 설정</h4>

        {Object.keys(chatParams).map((param) => (
          <div key={param} className="mb-2 flex items-center">
            <label htmlFor={param} className="w-40 font-medium text-gray-700">
              {param}:
            </label>
            <input
              id={param}
              type="number"
              value={chatParams[param as keyof typeof chatParams]}
              onChange={(e) => handleParamsChange(e, param)}
              className="w-32 p-1 border rounded-md text-sm"
            />
          </div>
        ))}

        <button
          onClick={handleParamsSubmit}
          disabled={isLoading}
          className={`mt-2 px-4 py-2 text-white rounded-lg transition ${
            isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isLoading ? '전송 중...' : '파라미터 전송'}
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
