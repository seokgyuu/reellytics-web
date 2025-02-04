"use client";

import React, { useState, useEffect, useRef } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import PrivacyPolicy from "@/app/privacy-policy/page";
import TermOfService from "@/app/term-of-service/page";
import ChatBot from "@/components/ChatBot";
import History from "@/components/History";

interface ChatHistoryItem {
  id: number;
  created_at: string;
  updated_at: string;
  content_type: string;
  content: string;
  title?: string;
}

const Header: React.FC = () => {
  const { data: session } = useSession();
  const [activePage, setActivePage] = useState<string>("home");
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [selectedChatDetails, setSelectedChatDetails] = useState<ChatHistoryItem | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 히스토리 가져오기
  useEffect(() => {
    if (session?.accessToken) {
      fetchChatHistory();
    }
  }, [session]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // 채팅 히스토리 불러오기
  const fetchChatHistory = async () => {
    try {
      const response = await fetch("https://api.reelstatics.com/api/v1/reelstatics/history", {
        method: "GET",
        headers: {
          Authorization: session?.accessToken || "",
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.statusText}`);
      }

      const data = await response.json();
      setChatHistory(data.result || []);
    } catch (error) {
      console.error("히스토리 가져오기 오류:", error);
    }
  };

  const patchChatTitle = async (chatId: number, newTitle: string) => {
    try {
      const response = await fetch(`https://api.reelstatics.com/api/v1/reelstatics/history/${chatId}`, {
        method: "PATCH",
        headers: {
          Authorization: session?.accessToken || "",
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: newTitle }),
      });

      if (!response.ok) {
        throw new Error(`제목 수정 실패: ${response.statusText}`);
      }

      console.log("제목 수정 성공");
      return true;
    } catch (error) {
      console.error("제목 수정 오류:", error);
      return false;
    }
  };

  const handleTitleUpdate = async (chatId: number, newTitle: string) => {
    const success = await patchChatTitle(chatId, newTitle);
    if (success) {
      setChatHistory((prev) =>
        prev.map((item) => (item.id === chatId ? { ...item, title: newTitle } : item))
      );
    }
  };

  // 채팅 히스토리
  const fetchChatDetails = (chat: ChatHistoryItem) => {
    setSelectedChatDetails(chat);
  };

  // 렌더링할 페이지
  const renderContent = () => {
    switch (activePage) {
      case "privacy-policy":
        return <PrivacyPolicy />;
      case "term-of-service":
        return <TermOfService />;
      case "chat":
        return <ChatBot accessToken={session?.accessToken || ""} />;
      case "history":
        return <History chatHistory={chatHistory} onChatSelect={fetchChatDetails} onTitleUpdate={handleTitleUpdate} />;
      default:
        return <div className="text-center mt-10">뭐 넣을지 고민</div>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 bg-gray-200 shadow-md flex justify-between items-center relative z-20">
        <span onClick={() => setActivePage("home")} className="font-bold text-2xl cursor-pointer">
          REELLYTICS
        </span>

        {session ? (
          <div className="relative" ref={dropdownRef}>
            <span onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="cursor-pointer">
              {session.user?.name} 님 환영합니다!
            </span>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-md z-30">
                <ul className="py-2">
                  <li onClick={() => setActivePage("privacy-policy")} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    Privacy Policy
                  </li>
                  <li onClick={() => setActivePage("term-of-service")} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    Terms of Service
                  </li>
                  <li onClick={() => setActivePage("chat")} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    ChatBot
                  </li>
                  <li onClick={() => setActivePage("history")} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    Chat History
                  </li>
                  <li onClick={() => signOut()} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    로그아웃
                  </li>
                </ul>
              </div>
            )}
          </div>
        ) : (
          <button onClick={() => signIn("keycloak")} className="text-gray-800 hover:text-black transition">
            Login
          </button>
        )}
      </header>

      <main className="flex-1 p-6">
        {selectedChatDetails ? (
          <div className="p-4 border rounded shadow">
            <h3 className="text-xl font-bold mb-2">채팅 상세 정보</h3>
            <p><strong>채팅 ID:</strong> {selectedChatDetails.id}</p>
            <p><strong>생성일:</strong> {new Date(selectedChatDetails.created_at).toLocaleString()}</p>
            <p><strong>업데이트일:</strong> {new Date(selectedChatDetails.updated_at).toLocaleString()}</p>
            <p><strong>내용 유형:</strong> {selectedChatDetails.content_type}</p>
            <pre className="bg-gray-100 p-2 rounded mt-2 whitespace-pre-wrap">{selectedChatDetails.content}</pre>
            <button onClick={() => setSelectedChatDetails(null)} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">뒤로 가기</button>
          </div>
        ) : (
          renderContent()
        )}
      </main>
    </div>
  );
};

export default Header;