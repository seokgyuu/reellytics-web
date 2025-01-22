"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { marked } from "marked";
import { v4 as uuidv4 } from "uuid";

const ChatBot: React.FC = () => {
  const chatLogRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([
    { sender: "AI", text: "안녕하세요! 무엇을 도와드릴까요?" },
  ]);
  const [userInput, setUserInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 세션 ID 생성
  const sessionId = useState<string>(() => {
    const storedSession = sessionStorage.getItem("session_id");
    if (storedSession) return storedSession;
    const newSessionId = uuidv4();
    sessionStorage.setItem("session_id", newSessionId);
    return newSessionId;
  })[0];

  // 스크롤 동작
  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  }, [messages]);

  // AI API 호출 함수
  const fetchGPTResponse = async (input: string): Promise<string> => {
    try {
      const apiUrl = "http://localhost:5000/chat"; // 서버 URL

      const response = await axios.post(apiUrl, {
        message: input,
        session_id: sessionId,
      });

      return response.data.response || "응답을 받지 못했습니다.";
    } catch (error) {
      console.error("Error fetching GPT response:", error);
      return "서버 연결에 실패했습니다. 나중에 다시 시도해주세요.";
    }
  };

  // 사용자 메시지 처리
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const userMessage = { sender: "사용자", text: userInput };
    setMessages((prev) => [...prev, userMessage]);
    setUserInput("");
    setIsLoading(true);

    const gptMessage = await fetchGPTResponse(userInput);
    setMessages((prev) => [...prev, { sender: "AI", text: gptMessage }]);
    setIsLoading(false);
  };

  return (
    <div
      id="Chatbot"
      className="absolute top-[100px] left-0 right-0 bottom-0 flex flex-col max-w-[1280px] h-[calc(100vh-100px)] bg-white overflow-hidden z-10 mx-auto sm:w-[95%]"
    >
      <div
        id="chat-log"
        ref={chatLogRef}
        className="flex-grow overflow-y-auto p-4 text-sm leading-6 flex flex-col justify-start"
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`${
              msg.sender === "사용자"
                ? "bg-green-100 self-end"
                : "bg-gray-200 self-start"
            } p-2 rounded-2xl max-w-[80%] mb-2 whitespace-pre-wrap`}
          >
            {msg.sender === "AI" ? (
              <div
                dangerouslySetInnerHTML={{ __html: marked(msg.text) }}
                className="prose"
              />
            ) : (
              msg.text
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center justify-center">
            <div className="spinner"></div>
          </div>
        )}
      </div>
      <form
        onSubmit={handleFormSubmit}
        className="flex p-2 border-t border-gray-300 bg-white items-center"
      >
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="메시지를 입력하세요"
          className="flex-grow p-2 rounded-2xl bg-gray-100 focus:outline-none"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="ml-2 px-4 py-2 bg-black text-white rounded-2xl hover:bg-gray-800 transition disabled:bg-gray-400"
        >
          {isLoading ? "전송 중..." : "전송"}
        </button>
      </form>
    </div>
  );
};

export default ChatBot;
