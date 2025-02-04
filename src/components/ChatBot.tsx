"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { useSession } from "next-auth/react";

const ChatBot: React.FC = () => {
  const chatLogRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>(() => {
    // sessionStorage에서 로그 복원
    const storedMessages = sessionStorage.getItem("chat_log");
    return storedMessages
      ? JSON.parse(storedMessages)
      : [{ sender: "AI", text: "안녕하세요! 무엇을 도와드릴까요?" }];
  });
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

  // 채팅 로그를 sessionStorage에 저장
  useEffect(() => {
    sessionStorage.setItem("chat_log", JSON.stringify(messages));
  }, [messages]);

  // analyze API 호출 함수
  const callAnalyzeAPI = async () => {
    if (!session?.accessToken) {
      console.error("액세스 토큰이 없습니다.");
      return null;
    }

    const reqUrl = "https://api.reelstatics.com/api/v1/reelstatics/analyze";
    const payload = {
      followers: Math.floor(Math.random() * 1000),  
      elapsed_time: 120, 
      video_length: userInput.length, 
      avg_watch_time: 1, 
      views: Math.floor(Math.random() * 500), 
      likes: Math.floor(Math.random() * 50),  
      comments: 0,
      shares: 0,
      saves: 0,
      follows: 2,
    };

    try {
      console.log("analyze API 호출 중, payload:", payload);
      const response = await axios.post(reqUrl, payload, {
        headers: {
          Authorization: `${session.accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      console.log("analyze API 응답:", response.data);
      return response.data; 
    } catch (error) {
      console.error("analyze API 호출 중 오류:", error);
      return null;
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

    // POST 요청으로 analyze API 호출 및 결과 받아오기
    const analyzeResult = await callAnalyzeAPI();

    if (analyzeResult) {
      setMessages((prev) => [
        ...prev,
        { sender: "AI", text: JSON.stringify(analyzeResult, null, 2) },
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        { sender: "AI", text: "analyze API 응답을 가져오지 못했습니다." },
      ]);
    }

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
            {msg.text}
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