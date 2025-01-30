"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/utils/firebaseConfig";
import { getAuth, onAuthStateChanged } from "firebase/auth";

interface Message {
  sender: string;
  text: string;
  timestamp?: any;
}

const ChatList: React.FC = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [sessionIds, setSessionIds] = useState<string[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 로그인된 사용자 이메일 가져오기
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.email) {
        console.log("로그인된 유저 이메일:", user.email);
        setUserEmail(user.email);
      } else {
        console.warn("로그인되지 않은 사용자입니다.");
      }
    });

    return () => unsubscribe();
  }, []);

  // 사용자 이메일을 기준으로 세션 ID 가져오기
  useEffect(() => {
    const fetchSessionIds = async () => {
      if (!userEmail) {
        console.warn("사용자 이메일이 설정되지 않았습니다.");
        return;
      }

      setIsLoading(true);

      try {
        const sessionsRef = collection(db, "chat_sessions", userEmail, "sessions");
        const querySnapshot = await getDocs(sessionsRef);

        if (!querySnapshot.empty) {
          const fetchedSessionIds = querySnapshot.docs.map((doc) => doc.id);
          console.log("가져온 세션 ID들:", fetchedSessionIds);
          setSessionIds(fetchedSessionIds);
        } else {
          console.warn(`유저 ${userEmail}의 세션이 존재하지 않습니다.`);
        }
      } catch (error) {
        console.error("세션 ID를 가져오지 못했습니다:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionIds();
  }, [userEmail]);

  // 선택된 세션의 메시지 불러오기
  const loadMessages = async (sessionId: string) => {
    if (!userEmail) {
      console.error("사용자 이메일이 없습니다.");
      return;
    }

    try {
      setSelectedSessionId(sessionId);
      const messagesRef = collection(db, "chat_sessions", userEmail, "sessions", sessionId, "messages");
      const q = query(messagesRef, orderBy("timestamp"));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const loadedMessages = querySnapshot.docs.map((doc) => doc.data() as Message);
        console.log(`세션 ${sessionId}의 메시지 불러오기 성공:`, loadedMessages);
        setMessages(loadedMessages);
      } else {
        console.warn(`세션 ${sessionId}의 메시지가 없습니다.`);
      }
    } catch (error) {
      console.error("메시지 불러오기 실패:", error);
    }
  };

  return (
    <div className="flex max-w-5xl mx-auto mt-10 bg-white rounded shadow">
      {/* 세션 목록 */}
      <div className="w-1/4 bg-gray-100 p-4 border-r">
        <h2 className="text-xl font-semibold mb-4">Chat Sessions</h2>
        {isLoading ? (
          <p>세션을 불러오는 중입니다...</p>
        ) : (
          <ul className="space-y-2">
            {sessionIds.length > 0 ? (
              sessionIds.map((sessionId) => (
                <li key={sessionId}>
                  <button
                    onClick={() => loadMessages(sessionId)}
                    className={`block w-full text-left px-4 py-2 rounded ${
                      selectedSessionId === sessionId ? "bg-blue-200" : "bg-white"
                    } hover:bg-blue-100`}
                  >
                    {sessionId}
                  </button>
                </li>
              ))
            ) : (
              <p>No chat sessions available.</p>
            )}
          </ul>
        )}
      </div>

      {/* 채팅 창 */}
      <div className="w-3/4 flex flex-col p-4">
        <h2 className="text-xl font-semibold mb-4">
          {selectedSessionId ? `Session: ${selectedSessionId}` : "세션을 선택하세요"}
        </h2>

        {/* 메시지 로그 */}
        <div className="flex-grow overflow-y-auto bg-gray-50 p-4 rounded">
          {messages.length > 0 ? (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-2 p-2 rounded ${
                  msg.sender === "사용자" ? "bg-green-100 self-end" : "bg-gray-200 self-start"
                }`}
              >
                <strong>{msg.sender}: </strong>
                {msg.text}
              </div>
            ))
          ) : (
            <p>해당 세션에 메시지가 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatList;
