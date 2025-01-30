'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { marked } from 'marked';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../utils/firebaseConfig';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';  
import { AiOutlineReload } from 'react-icons/ai';
import useFirebaseAuth from '@/hooks/useFirebaseAuth';

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
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useFirebaseAuth();

  // 컴포넌트가 마운트될 때 sessionId를 복구하거나 새로 생성
  useEffect(() => {
    const storedSessionId = sessionStorage.getItem('sessionId');
    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      const newSessionId = uuidv4();
      sessionStorage.setItem('sessionId', newSessionId);
      setSessionId(newSessionId);
    }
  }, []);

  // 사용자 이메일 설정
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && session?.user?.email) {
        setUserEmail(session.user.email);
        setAccessToken(session.accessToken ?? null);
      } else {
        setUserEmail(null);
      }
    });
    return () => unsubscribe();
  }, [session]);

  const loadMessagesFromFirestore = useCallback(async () => {
    if (!userEmail || !sessionId) return;
    try {
      const messagesRef = collection(db, 'chat_sessions', userEmail, 'sessions', sessionId, 'messages');
      const q = query(messagesRef, orderBy('timestamp'));
      const querySnapshot = await getDocs(q);
      const loadedMessages = querySnapshot.docs.map((doc) => doc.data() as { sender: string; text: string });
      setMessages(loadedMessages);
    } catch (error) {
      console.error('Firestore 메시지 불러오기 실패:', error);
    }
  }, [userEmail, sessionId]);

  useEffect(() => {
    if (userEmail && sessionId) {
      loadMessagesFromFirestore();
    }
  }, [userEmail, sessionId, loadMessagesFromFirestore]);

  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  }, [messages]);

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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !userEmail) return;

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

  const saveMessageToFirestore = async (message: { sender: string; text: string }) => {
    if (!userEmail || !sessionId) {
      console.error('사용자 이메일 또는 세션 ID가 설정되지 않아 메시지를 저장할 수 없습니다.');
      return;
    }

    try {
      const messagesRef = collection(db, 'chat_sessions', userEmail, 'sessions', sessionId, 'messages');
      await addDoc(messagesRef, {
        ...message,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Firestore에 메시지 저장 실패:', error);
    }
  };

  const startNewChat = () => {
    const newSessionId = uuidv4();
    setSessionId(newSessionId);
    sessionStorage.setItem('sessionId', newSessionId);
    setMessages([]);
    console.log('새로운 세션 시작:', newSessionId);
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

      <form onSubmit={handleFormSubmit} className="flex items-center border-t border-gray-300 bg-white p-2">
        <AiOutlineReload
          size={24}
          className="mr-2 text-gray-600 hover:text-blue-500 cursor-pointer"
          onClick={startNewChat}
          title="새 채팅 시작"
        />
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="메시지를 입력하세요"
          className="flex-grow p-2 rounded-2xl bg-gray-100 focus:outline-none"
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading} className="ml-2 px-4 py-2 bg-black text-white rounded-2xl hover:bg-gray-800 transition disabled:bg-gray-400">
          {isLoading ? '전송 중...' : '전송'}
        </button>
      </form>
    </div>
  );
};

export default ChatBot;