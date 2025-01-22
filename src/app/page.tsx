'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ChatBot from '@/components/ChatBot';
import { useSession } from 'next-auth/react';

export default function Page() {
  const [currentView, setCurrentView] = useState<string>('chatbot');
  const { data: session } = useSession();

  // 브라우저 환경에서만 `sessionStorage` 사용
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedView = sessionStorage.getItem('currentView');
      if (savedView) {
        setCurrentView(savedView);
      }
    }
  }, []);

  const handleNavClick = (view: string) => {
    setCurrentView(view);

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('currentView', view); // 브라우저 환경에서만 저장
    }
  };

  return (
    <Header currentView={currentView} onNavClick={handleNavClick} session={session}>
      {currentView === 'chatbot' && <ChatBot />}
    </Header>
  );
}
