'use client';

import React, { useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import PrivacyPolicy from '@/app//privacy-policy/page';
import TermOfService from '@/app/term-of-service/page';
import ChatBot from '@/components/ChatBot';

interface HeaderProps {
  accessToken: string | null;
}

const Header: React.FC<HeaderProps> = ({ accessToken }) => {
  const { data: session } = useSession();
  const [activePage, setActivePage] = useState<string>('home');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // 드롭다운에서 선택된 페이지 렌더링
  const renderContent = () => {
    switch (activePage) {
      case 'privacy-policy':
        return <PrivacyPolicy />;
      case 'term-of-service':
        return <TermOfService />;
      case 'chat':
        return <ChatBot accessToken={accessToken || ''} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 bg-gray-100 flex justify-between items-center relative z-50">
        <span
          onClick={() => setActivePage('home')}
          className="font-bold text-xl cursor-pointer"
        >
          REELLYTICS
        </span>

        {session ? (
          <div className="relative">
            <span
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="cursor-pointer text-gray-800 font-medium"
            >
              {session.user?.name} 님 환영합니다!
            </span>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-md z-50">
                <ul className="py-2 text-gray-700">
                  <li
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setActivePage('privacy-policy');
                      setIsDropdownOpen(false);
                    }}
                  >
                    Privacy Policy
                  </li>
                  <li
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setActivePage('term-of-service');
                      setIsDropdownOpen(false);
                    }}
                  >
                    Terms of Service
                  </li>
                  <li
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setActivePage('chat');
                      setIsDropdownOpen(false);
                    }}
                  >
                    ChatBot
                  </li>
                  <li
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setActivePage('home');
                      setIsDropdownOpen(false);
                      signOut();
                    }}
                  >
                    Sign Out
                  </li>
                </ul>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => signIn('google')}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            로그인
          </button>
        )}
      </header>

      <main className="flex-1">{renderContent()}</main>
    </div>
  );
};

export default Header;
