'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { marked } from 'marked';
import { v4 as uuidv4 } from 'uuid';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../utils/firebaseConfig';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import useFirebaseAuth from '@/hooks/useFirebaseAuth'; // 추가한 훅 가져오기

interface ChatBotProps {
  session: {
    user?: {
      name?: string | null;
      email?: string | null;
    };
    accessToken?: string;
  } | null;
}

const ChatBot: React.FC<ChatBotProps> = ({ session }) => {
  const chatLogRef = useRef<HTMLDivElement>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useFirebaseAuth(); // Firebase 사용자 인증 상태 유지

  // 세션 ID 초기화 및 설정 보장
  useEffect(() => {
    const storedSession = sessionStorage.getItem('session_id') || uuidv4();
    sessionStorage.setItem('session_id', storedSession);
    setSessionId(storedSession);
  }, []);

  // 인증 상태 확인
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && session?.accessToken) {
        setIsAuthenticated(true);
        setAccessToken(session.accessToken);
        console.log('Firebase 및 NextAuth 인증 성공:', user.email);
      } else {
        setIsAuthenticated(false);
        setAccessToken(null);
        console.warn('Firebase 또는 NextAuth 인증 실패.');
      }
    });

    return () => unsubscribe();
  }, [session]);

  // Firestore에서 메시지 불러오기 (useCallback으로 메모이제이션)
  const loadMessagesFromFirestore = useCallback(async () => {
    if (!sessionId || !isAuthenticated) {
      console.warn('유효한 세션 ID가 없거나 인증되지 않은 사용자입니다.');
      return;
    }

    try {
      const messagesRef = collection(db, 'chat_sessions', sessionId, 'messages');
      const q = query(messagesRef, orderBy('timestamp'));
      const querySnapshot = await getDocs(q);
      const loadedMessages = querySnapshot.docs.map((doc) => doc.data() as { sender: string; text: string });
      setMessages(loadedMessages);
    } catch (error) {
      console.error('Firestore 메시지 불러오기 실패:', error);
    }
  }, [sessionId, isAuthenticated]);

  // 세션 ID와 인증 상태가 모두 준비된 후 Firestore 메시지 불러오기
  useEffect(() => {
    if (sessionId && isAuthenticated) {
      loadMessagesFromFirestore();
    }
  }, [sessionId, isAuthenticated, loadMessagesFromFirestore]);

  // 스크롤 자동 하단 이동
  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  }, [messages]);

  // AI API 호출
  const fetchGPTResponse = async (input: string): Promise<string> => {
    if (!accessToken) {
      return '로그인 후 이용해주세요';
    }
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/chat`;
      const response = await axios.post(apiUrl, {
        query: input,
        session_id: sessionId,
        access_token: accessToken,
        name: session?.user?.name,
      });

      return response.data.response || '응답을 받지 못했습니다.';
    } catch (error) {
      console.error('AI 응답 오류:', error);
      return '서버 연결에 실패했습니다. 나중에 다시 시도해주세요.';
    }
  };

  // 사용자 입력 처리
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    if (!isAuthenticated) {
      setMessages((prev) => [
        ...prev,
        { sender: 'AI', text: '로그인 후 메시지를 보낼 수 있습니다.' },
      ]);
      return;
    }

    const userMessage = { sender: '사용자', text: userInput };
    setMessages((prev) => [...prev, userMessage]);
    await saveMessageToFirestore(userMessage);

    setUserInput('');
    setIsLoading(true);

    const gptResponse = await fetchGPTResponse(userInput);
    const aiMessage = { sender: 'AI', text: gptResponse };

    setMessages((prev) => [...prev, aiMessage]);
    await saveMessageToFirestore(aiMessage);

    setIsLoading(false);
  };

  // Firestore에 메시지 저장하기
  const saveMessageToFirestore = async (message: { sender: string; text: string }) => {
    if (!sessionId) {
      console.error('유효하지 않은 세션 ID로 메시지를 저장할 수 없습니다.');
      return;
    }

    try {
      const messagesRef = collection(db, 'chat_sessions', sessionId, 'messages');
      await addDoc(messagesRef, {
        ...message,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Firestore에 메시지 저장 실패:', error);
    }
  };

  return (
    <div id="Chatbot" className="absolute top-[100px] left-0 right-0 bottom-0 flex flex-col max-w-[1280px] h-[calc(100vh-100px)] bg-white overflow-hidden z-10 mx-auto sm:w-[95%]">
      <div id="chat-log" ref={chatLogRef} className="flex-grow overflow-y-auto p-4 text-sm leading-6 flex flex-col justify-start">
        {messages.map((msg, index) => (
          <div key={index} className={`${msg.sender === '사용자' ? 'bg-green-100 self-end' : 'bg-gray-200 self-start'} p-2 rounded-2xl max-w-[80%] mb-2 whitespace-pre-wrap`}>
            {msg.sender === 'AI' ? <div dangerouslySetInnerHTML={{ __html: marked(msg.text) }} className="prose" /> : msg.text}
          </div>
        ))}
        {isLoading && <div className="flex items-center justify-center"><div className="spinner"></div></div>}
      </div>
      <form onSubmit={handleFormSubmit} className="flex p-2 border-t border-gray-300 bg-white items-center">
        <textarea value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="메시지를 입력하세요" className="flex-grow p-2 rounded-2xl bg-gray-100 focus:outline-none" disabled={isLoading} />
        <button type="submit" disabled={isLoading} className="ml-2 px-4 py-2 bg-black text-white rounded-2xl hover:bg-gray-800 transition disabled:bg-gray-400">
          {isLoading ? '전송 중...' : '전송'}
        </button>
      </form>
    </div>
  );
};

export default ChatBot;
