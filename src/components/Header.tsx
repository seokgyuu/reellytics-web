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
  const [selectedTimeRange, setSelectedTimeRange] = useState<number | null>(null); 
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
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
      const response = await fetch("https://api.reelstatics.com/api/v1/reelstatics/history?limit=30", {
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

  const handleTitleUpdate = async (chatId: number, newTitle: string) => {
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

      setChatHistory((prev) =>
        prev.map((item) => (item.id === chatId ? { ...item, title: newTitle } : item))
      );

      console.log("제목 수정 성공");
    } catch (error) {
      console.error("제목 수정 오류:", error);
    }
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedTimeRange(parseInt(e.target.value));
  };

  const callAnalyzeAPI = async () => {
    if (selectedTimeRange === null) {
      alert("시간 범위를 선택하세요!");
      return;
    }
  
    if (!selectedChatDetails) {
      alert("상세정보가 없습니다.");
      return;
    }
  
    // 라디오 버튼 값에서 분 단위로 변환된 elapsed_time
    const elapsed_time = selectedTimeRange * 60;
  
    // 상세정보에서 필요한 데이터 추출 및 payload 생성
    const content = selectedChatDetails.content || {};
    const payload = {
      followers: content["팔로워 수"] && content["팔로워 수"] > 0 ? content["팔로워 수"] : 1,  
      elapsed_time: elapsed_time,
      video_length: content["영상 길이"] && content["영상 길이"] > 0 ? content["영상 길이"] : 1,  
      avg_watch_time: content["평균 시청 유지 시간"] || 1,
      views: content["조회수"] || 1,  
      likes: content["좋아요"] || 0,
      comments: content["댓글"] || 0,
      shares: content["공유"] || 0,
      saves: content["저장"] || 0,
      follows: content["팔로우 증가"] || 0,
    };
  
    console.log("API 요청 payload:", payload); 
  
    try {
      const response = await fetch("https://api.reelstatics.com/api/v1/reelstatics/analyze", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        const errorResponse = await response.json();
        console.error("API 오류 응답:", errorResponse);
        throw new Error(`API 호출 실패: ${response.statusText}`);
      }
  
      const result = await response.json();
      console.log("API 응답:", result);
      alert("API 호출 성공");
    } catch (error) {
      console.error("API 호출 중 오류:", error);
      alert("API 호출 실패");
    }
  };
  

  const fetchHistoryContents = async (chatId: number) => {
    const reqUrl = `https://api.reelstatics.com/api/v1/reelstatics/history/${chatId}`;
    try {
      const response = await fetch(reqUrl, {
        method: "GET",
        headers: {
          Authorization: session?.accessToken || "",
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        throw new Error(`히스토리 콘텐츠 요청 실패: ${response.statusText}`);
      }
  
      return await response.json();
    } catch (error) {
      console.error("히스토리 콘텐츠 가져오기 중 오류:", error);
      return null;
    }
  };
  

  const handleHistoryContentFetch = async (chatId: number) => {
    const data = await fetchHistoryContents(chatId);
    if (data && data.status === 200 && Array.isArray(data.result)) {
      const parsedResults = data.result.map((item: any) => {
        let parsedContent;
        try {
          const cleanContent = item.content.trim().replace(/^json\s*/i, "");
          parsedContent = JSON.parse(cleanContent);
        } catch (error) {
          parsedContent = item.content;
        }
        return { ...item, content: parsedContent };
      });

      setSelectedChatDetails(parsedResults[0]);
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
        return <History
          chatHistory={chatHistory}
          onChatSelect={(chat) => { 
            setSelectedChatDetails(chat); 
            handleHistoryContentFetch(chat.id); 
          }}
          onTitleUpdate={handleTitleUpdate} 
        />;
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
          <div className="p-4 border rounded shadow relative z-10 bg-white">
            <h3 className="text-xl font-bold mb-2">채팅 상세 정보</h3>
            <p><strong>채팅 ID:</strong> {selectedChatDetails.id}</p>
            <p><strong>생성일:</strong> {new Date(selectedChatDetails.created_at).toLocaleString()}</p>
            <p><strong>업데이트일:</strong> {new Date(selectedChatDetails.updated_at).toLocaleString()}</p>
            <p><strong>내용 유형:</strong> {selectedChatDetails.content_type}</p>

            <h4 className="mt-4 font-semibold">Content 상세:</h4>
            <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap">
              {typeof selectedChatDetails.content === "object"
                ? JSON.stringify(selectedChatDetails.content, null, 2)
                : selectedChatDetails.content}
            </pre>

            <div className="mt-6">
              <h4 className="font-semibold mb-2">시간 범위 선택:</h4>
              <div className="flex flex-col space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="radio" name="timeRange" value="12" className="form-radio h-4 w-4" onChange={handleRadioChange} />
                  <span>0시간 ~ 24시간</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="timeRange" value="36" className="form-radio h-4 w-4" onChange={handleRadioChange} />
                  <span>24시간 ~ 48시간</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="timeRange" value="60" className="form-radio h-4 w-4" onChange={handleRadioChange} />
                  <span>48시간 ~ 72시간</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="timeRange" value="72" className="form-radio h-4 w-4" onChange={handleRadioChange} />
                  <span>72시간 ~</span>
                </label>
              </div>
            </div>

            <div className="mt-4 flex gap-4">
              <button onClick={callAnalyzeAPI} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                전송
              </button>
              <button onClick={() => setSelectedChatDetails(null)} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                뒤로 가기
              </button>
            </div>
          </div>
        ) : (
          renderContent()
        )}
      </main>
    </div>
  );
};

export default Header;
