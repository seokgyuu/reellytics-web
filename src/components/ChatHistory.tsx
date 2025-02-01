"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";

interface ChatHistoryItem {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  template_id: number;
}

const ChatHistory: React.FC = () => {
  const { data: session } = useSession();
  const accessToken = session?.accessToken || "";

  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!accessToken) {
        setError("로그인이 필요합니다.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/history`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data && Array.isArray(response.data.result)) {
          setChatHistory(response.data.result);
        } else {
          throw new Error("API 응답 데이터가 예상과 다릅니다.");
        }
      } catch (err) {
        console.error("API 요청 오류:", err);
        setError("채팅 내역을 불러오는 중 문제가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatHistory();
  }, [accessToken]);

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">채팅 내역</h2>
      {chatHistory.length === 0 ? (
        <div>채팅 내역이 없습니다.</div>
      ) : (
        <ul>
          {chatHistory.map((chat) => (
            <li key={chat.id} className="mb-4 p-4 border rounded shadow">
              <p className="text-lg font-semibold">제목: {chat.title}</p>
              <p className="text-sm text-gray-600">생성일: {chat.created_at}</p>
              <p className="text-sm text-gray-600">업데이트일: {chat.updated_at}</p>
              <p className="text-sm text-gray-600">사용자: {chat.user_id}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ChatHistory;
