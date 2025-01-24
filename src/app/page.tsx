'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import ChatBot from '@/components/ChatBot';
import { useSession } from 'next-auth/react';

export default function Page() {
  const { data: session, status } = useSession();

  const [currentView, setCurrentView] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('currentView') || 'chatbot';
    }
    return 'chatbot';
  });

  //sessionStorage에 저장
  const handleNavClick = (view: string) => {
    setCurrentView(view);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('currentView', view);
    }
  };

  // 이미지로 변경해야할듯
  if (status === 'loading') {
    return <div>로딩중 입니다.</div>;
  }

  return (
    <Header currentView={currentView} onNavClick={handleNavClick} session={session}>
      {currentView === 'chatbot' ? <ChatBot /> : <div>현재 지원하지 않는 뷰입니다.</div>}
    </Header>
  );
}
