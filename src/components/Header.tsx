"use client";

import React, { useState, useEffect, useRef } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import PrivacyPolicy from "@/app/privacy-policy/page";
import TermOfService from "@/app/term-of-service/page";
import ChatBot from "@/components/ChatBot";
import History from "@/components/History";

interface ChatHistoryItem {
  id: number;
  title: string;
  created_at: string;
}

const Header: React.FC = () => {
  const { data: session } = useSession();
  const [activePage, setActivePage] = useState<string>("home");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const fetchChatHistory = async () => {
    try {
      const response = await fetch("https://api.reelstatics.com/api/v1/reelstatics/history", {
        method: "GET",
        headers: {
          "Authorization": session?.accessToken || "",
          "Accept": "application/json",
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

  const renderContent = () => {
    switch (activePage) {
      case "privacy-policy":
        return <PrivacyPolicy />;
      case "term-of-service":
        return <TermOfService />;
      case "chat":
        return <ChatBot accessToken={session?.accessToken || ""} />;
      case "history":
        return <History chatHistory={chatHistory} />;
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

      <main className="flex-1 p-6">{renderContent()}</main>
    </div>
  );
};

export default Header;
