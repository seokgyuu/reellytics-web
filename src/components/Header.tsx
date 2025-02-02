import React, { useState, useEffect, useRef } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { signIn } from 'next-auth/react'; // 로그인 요청에 사용
import fetchWithToken from '@/utils/fetchWithToken';
import ChatBot from '@/components/ChatBot';

interface NavProps {
  currentView: string;
  onNavClick: (view: string) => void;
  session: any;
  children: React.ReactNode;
}

const Header: React.FC<NavProps> = ({ currentView, onNavClick, session, children }) => {
  const [activePage, setActivePage] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogin = async () => {
    await signIn('keycloak');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="header fixed top-0 left-0 w-full bg-white bg-opacity-90 backdrop-blur-md shadow-md z-50">
        <div className="header__inner flex justify-between items-center p-4 max-w-screen-xl mx-auto">
          <div className="header__logo text-lg font-bold">
            <a href="#" className="text-gray-800" onClick={() => setActivePage('')}>
              REELLYTICS
            </a>
          </div>

          <nav className="header__nav">
            <ul className="flex items-center">
              <li className="ml-6">
                <a
                  href="#"
                  onClick={() => {
                    setActivePage('');
                    onNavClick('chatbot');
                  }}
                  className={`flex items-center text-gray-700 transition-all ${
                    currentView === 'chatbot' ? 'text-blue-500' : 'hover:text-black'
                  }`}
                >
                  Chatbot
                </a>
              </li>
              <li className="ml-6">
                {session ? (
                  <div>
                    <span className="text-gray-700">
                      환영합니다, {session.user?.name}
                    </span>
                    <button onClick={() => signOut()} className="ml-2 text-red-500">
                      로그아웃
                    </button>
                  </div>
                ) : (
                  <button onClick={handleLogin} className="text-blue-500">
                    로그인
                  </button>
                )}
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="flex-1 mt-[100px]">{children}</main>
    </div>
  );
};

export default Header;
