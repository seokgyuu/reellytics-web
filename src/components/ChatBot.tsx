"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { useSession } from "next-auth/react";

interface ChatBotProps {
  accessToken: string;
}

const ChatBot: React.FC<ChatBotProps> = ({ accessToken }) => {
  const chatLogRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>(() => {
    const storedMessages = sessionStorage.getItem("chat_log");
    return storedMessages
      ? JSON.parse(storedMessages)
      : [{ sender: "AI", text: "데이터를 입력해주세요" }];
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [parameters, setParameters] = useState({
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
  });

  const sessionId = useState<string>(() => {
    const storedSession = sessionStorage.getItem("session_id");
    if (storedSession) return storedSession;
    const newSessionId = uuidv4();
    sessionStorage.setItem("session_id", newSessionId);
    return newSessionId;
  })[0];

  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    sessionStorage.setItem("chat_log", JSON.stringify(messages));
  }, [messages]);

  const handleParameterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParameters((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const callAnalyzeAPI = async () => {
    if (!session?.accessToken) {
      console.error("액세스 토큰이 없습니다.");
      return null;
    }

    const reqUrl = "https://api.reelstatics.com/api/v1/reelstatics/analyze";

    const payload = {
      followers: parameters.followers,
      elapsed_time: parameters.elapsed_time,
      video_length: parameters.video_length,
      avg_watch_time: parameters.avg_watch_time,
      views: parameters.views,
      likes: parameters.likes,
      comments: parameters.comments,
      shares: parameters.shares,
      saves: parameters.saves,
      follows: parameters.follows,
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

  const handleSubmit = async () => {
    setIsLoading(true);
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
    <div className="absolute top-[100px] left-0 right-0 bottom-0 flex max-w-[1280px] h-[calc(100vh-100px)] bg-white z-10 mx-auto sm:w-[95%]">
      <div
        id="chat-log"
        ref={chatLogRef}
        className="w-1/2 p-4 text-sm leading-6 overflow-y-auto border-r"
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

      <div className="w-1/2 p-4 overflow-y-auto">
        {[
          "followers",
          "elapsed_time",
          "video_length",
          "avg_watch_time",
          "views",
          "likes",
          "comments",
          "shares",
          "saves",
          "follows",
        ].map((param) => (
          <div key={param} className="mb-2">
            <label className="block mb-1">{param}</label>
            <input
              type="number"
              name={param}
              value={parameters[param as keyof typeof parameters]}
              onChange={handleParameterChange}
              className="w-full p-2 border rounded"
              placeholder={`Enter ${param}`}
            />
          </div>
        ))}
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="mt-4 w-full bg-black text-white p-2 rounded hover:bg-gray-800 transition disabled:bg-gray-400"
        >
          {isLoading ? "전송 중..." : "데이터 전송"}
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
