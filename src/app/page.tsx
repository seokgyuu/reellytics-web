"use client";

import React, { useState } from 'react';
import Header from '@/components/Header';
import ChatBot from '@/components/ChatBot';
import { useSession } from 'next-auth/react';
import { FaSpinner } from 'react-icons/fa';

export default function Page() {
  const { data: session, status } = useSession();

  const [currentView, setCurrentView] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('currentView') || 'chatbot';
    }
    return 'chatbot';
  });

  const handleNavClick = (view: string) => {
    setCurrentView(view);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('currentView', view);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="animate-spin text-gray-600 text-4xl" />
      </div>
    );
  }

  return (
    <Header currentView={currentView} onNavClick={handleNavClick} session={session}>
      {currentView === 'chatbot' ? (
        <ChatBot accessToken={session?.accessToken || ""} /> 
      ) : (
        <div>현재 지원하지 않는 뷰입니다.</div>
      )}
    </Header>
  );
}
