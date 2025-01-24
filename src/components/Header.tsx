'use client';

import React from 'react';
import { signOut, signIn } from 'next-auth/react';
import { Session } from 'next-auth';
import Link from 'next/link';

interface NavProps {
  currentView: string; // 현재 활성화된 뷰
  onNavClick: (view: string) => void; // 네비게이션 클릭 처리 함수
  session: Session | null; // 현재 세션 정보
  children: React.ReactNode; // 자식 컴포넌트
}

const Header: React.FC<NavProps> = ({ currentView, onNavClick, session, children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 헤더 영역 */}
      <header className="header fixed top-0 left-0 w-full bg-white bg-opacity-90 backdrop-blur-md shadow-md z-50">
        <div className="header__inner flex justify-between items-center p-4 max-w-screen-xl mx-auto">
          {/* 로고 */}
          <div className="header__logo text-lg font-bold">
            <a href="#" className="text-gray-800">
              REELLYTICS
            </a>
          </div>

          {/* 네비게이션 */}
          <nav className="header__nav">
            <ul className="flex items-center">
              {/* Chatbot 네비게이션 */}
              <li className="ml-6">
                <a
                  href="#"
                  onClick={() => onNavClick('chatbot')}
                  className={`flex items-center text-gray-700 transition-all ${
                    currentView === 'chatbot' ? 'text-blue-500' : 'hover:text-black'
                  }`}
                >
                  Chatbot
                </a>
              </li>

              {/* 로그인 및 로그아웃 */}
              <li className="ml-6">
                {session ? (
                  <button
                    onClick={() => signOut()}
                    className="text-red-500 hover:text-red-700 transition-all"
                  >
                    Sign Out
                  </button>
                ) : (
                  <div className="flex items-center space-x-4 relative">
                    {/* 로그인 버튼 */}
                    <button
                      onClick={() => signIn('google')}
                      className="text-gray-700 transition-all hover:text-black"
                    >
                      Login
                    </button>

                    {/* 약관 관련 메뉴 */}
                    <div className="relative group">
                      <div className="flex items-center relative">
                        <span className="text-gray-700 transition-all hover:text-black cursor-pointer">
                          Terms of Use
                        </span>
                        <div className="absolute left-0 mt-2 hidden group-hover:flex flex-row space-x-4 bg-white border border-gray-200 p-4 shadow-md rounded z-10">
                          <Link
                            href="/privacy-policy"
                            className="text-gray-700 hover:text-black transition-all"
                          >
                            Privacy Policy
                          </Link>
                          <Link
                            href="/term-of-service"
                            className="text-gray-700 hover:text-black transition-all"
                          >
                            Terms of Service
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 mt-[100px]">{children}</main>
    </div>
  );
};

export default Header;
