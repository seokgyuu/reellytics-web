"use client";

import React, { useState, useEffect, useRef } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import PrivacyPolicy from "@/app/privacy-policy/page";
import TermOfService from "@/app/term-of-service/page";
import ChatBot from "@/components/ChatBot";
import History from "@/components/History";
import ReactMarkdown from "react-markdown";
import { json } from "body-parser";

interface ChatHistoryItem {
  id: number;
  created_at: string;
  updated_at: string;
  content_type: string;
  content: {
    [key: string]: number; // 모든 key가 string이고 value는 number
  };
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
  const [apiResult, setApiResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
 
  const [parameters, setParameters] = useState({
    avg_watch_time: 0,
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    saves: 0,
    follows: 0,
  });

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

  const handleParameterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParameters((prev) => ({
      ...prev,
      [name]: parseInt(value) || 0,
    }));
  };

  const callAnalyzeAPI = async () => {
    if (selectedTimeRange === null) {
      alert("상세 정보와 시간 범위 모두 선택하세요.");
      return;
    }
    
    if (!selectedChatDetails) {
      alert("상세정보가 없습니다.");
      return;
    }

    setIsLoading(true);
  
    const payload = {
      followers: selectedChatDetails.content["팔로워 수"] > 0 
        ? selectedChatDetails.content["팔로워 수"] 
        : 1,  
  
      video_length: selectedChatDetails.content["영상 길이"] > 0 
        ? selectedChatDetails.content["영상 길이"] 
        : 1,  
  
      elapsed_time: selectedTimeRange * 60, 
      ...parameters,
    };
  
    console.log("API 요청 payload:", payload); 
  
    try {
      const response = await fetch("https://api.reelstatics.com/api/v1/reelstatics/analyze", {
        method: "POST",
        headers: {
          Authorization: session?.accessToken || "",
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
      setIsLoading(false);
  
      const result = await response.json();
      setApiResult(result); 
      alert("분석이 완료되었습니다!");
     
      setSelectedChatDetails((prev) => {
        if (!prev) return prev;
      
        // 새로 추가할 분석 결과를 객체로 변환
        const additionalResult: { [key: string]: number } = {
          [`추가 분석_${new Date().toISOString()}`]: result.someNumericValue || 0,
        };
      
        // 기존 content와 새 분석 결과를 병합
        const newContent = {
          ...prev.content,
          ...additionalResult,
        };
      
        return {
          ...prev,
          updated_at: new Date().toISOString(),
          content: newContent, // 객체로 병합된 content
        };
      });
      
  
      // 서버에 업데이트 (선택사항)
      await updateChatOnServer(selectedChatDetails.id, result);
  
    } catch (error) {
      console.error("분석 API 호출 오류:", error);
      alert("API 호출 중 오류 발생");
    } finally {
      setIsLoading(false);
    }
  };
  
  // 서버에 병합된 데이터 업데이트
  const updateChatOnServer = async (chatId: number, newContent: any) => {
    try {
      await fetch(`https://api.reelstatics.com/api/v1/reelstatics/history/${chatId}`, {
        method: "PATCH",
        headers: {
          Authorization: session?.accessToken || "",
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newContent }),
      });
      console.log("서버 업데이트 성공");
    } catch (error) {
      console.error("서버 업데이트 실패:", error);
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
        <span onClick={() => {
                      setSelectedChatDetails(null);
                      setActivePage("home");
                    }}
                      className="font-bold text-2xl cursor-pointer"
                      >
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
                  <li 
                    onClick={() => {
                      setSelectedChatDetails(null);
                      setActivePage("privacy-policy");
                    }} 
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    Privacy Policy
                  </li>
                  <li 
                    onClick={() => {
                      setSelectedChatDetails(null);
                      setActivePage("term-of-service");
                    }} 
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    Terms of Service
                  </li>
                  <li 
                    onClick={() => {
                      setSelectedChatDetails(null);
                      setActivePage("chat");
                    }} 
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    ChatBot
                  </li>
                  <li 
                    onClick={() => {
                      setSelectedChatDetails(null);
                      setActivePage("history");
                    }} 
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    Chat History
                  </li>
                  <li 
                    onClick={() => signOut()} 
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
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
  
            {apiResult && (
              <div className="mt-4 p-4 bg-green-100 rounded">
                <h4>추가 답변:</h4>
                <ReactMarkdown className="whitespace-pre-wrap">
                  {JSON.stringify(apiResult, null, 2)}
                </ReactMarkdown>

                {/* 이전 결과와 병합 */}
                <button 
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => {
                  if (selectedChatDetails) {
                    // 새로 추가할 분석 결과
                    const additionalResult: { [key: string]: number } = {
                      [`추가 분석_${new Date().toISOString()}`]: apiResult.someNumericValue || 0,
                    };
                    // content 객체에 새 데이터를 병합
                    const updatedContent = {
                      ...selectedChatDetails.content,
                      ...additionalResult,
                    };
                    // 상태 업데이트
                    setSelectedChatDetails({
                      ...selectedChatDetails,
                      updated_at: new Date().toISOString(),
                      content: updatedContent,
                    });

                    alert("추가 답변이 저장되었습니다.");
                  }
                }}
              >
                답변 저장
              </button>
              </div>
            )}

            <h4 className="mt-4 font-semibold">파라미터 입력:</h4>
            {Object.keys(parameters).map((param) => (
              <div key={param} className="mb-2">
                <label className="block font-medium">{param}</label>
                <input
                  type="number"
                  name={param}
                  value={parameters[param as keyof typeof parameters]}
                  onChange={handleParameterChange}
                  className="w-full p-2 border rounded"
                />
              </div>
            ))}

            <div className="mt-6">
              <h4 className="font-semibold mb-2">요청 후 지난 시간:</h4>
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
              <button 
                onClick={callAnalyzeAPI} 
                disabled={isLoading} 
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                {isLoading ? "전송 중..." : "데이터 전송"}
              </button>
              <button 
                onClick={() => setSelectedChatDetails(null)} 
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
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