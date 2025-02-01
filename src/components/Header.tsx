'use client';

import React, { useState, useEffect, useRef } from "react";
import { useSession, signOut, signIn } from "next-auth/react";
import ChatHistory from "@/components/ChatHistory";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermOfService from "@/pages/term-of-service";
import ChatBot from "@/components/ChatBot";

interface NavProps {
  currentView: string;
  onNavClick: (view: string) => void;
  session: any;
  children: React.ReactNode;
}

const Header: React.FC<NavProps> = ({ currentView, onNavClick, session, children }) => {
  const [activePage, setActivePage] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const accessToken = session?.accessToken; 

  const renderPage = () => {
    switch (activePage) {
      case "privacy-policy":
        return <PrivacyPolicy />;
      case "term-of-service":
        return <TermOfService />;
      case "chatlist":
        return <ChatHistory />;
      default:
        return children;
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="header fixed top-0 left-0 w-full bg-white bg-opacity-90 backdrop-blur-md shadow-md z-50">
        <div className="header__inner flex justify-between items-center p-4 max-w-screen-xl mx-auto">
          <div className="header__logo text-lg font-bold">
            <a href="#" className="text-gray-800" onClick={() => setActivePage("")}>
              REELLYTICS
            </a>
          </div>

          <nav className="header__nav">
            <ul className="flex items-center">
              <li className="ml-6">
                <a
                  href="#"
                  onClick={() => {
                    setActivePage("");
                    onNavClick("chatbot");
                  }}
                  className={`flex items-center text-gray-700 transition-all ${
                    currentView === "chatbot" ? "text-blue-500" : "hover:text-black"
                  }`}
                >
                  Chatbot
                </a>
              </li>

              <div className="ml-6 relative" ref={dropdownRef}>
                {session ? (
                  <div>
                    <span className="text-gray-700 cursor-pointer hover:underline" onClick={toggleDropdown}>
                      {session.user?.name}님 반갑습니다.
                    </span>

                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-md rounded z-10">
                        <button
                          onClick={() => setActivePage("chatlist")}
                          className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          Chat History
                        </button>
                        <button
                          onClick={() => setActivePage("privacy-policy")}
                          className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          Privacy Policy
                        </button>
                        <button
                          onClick={() => setActivePage("term-of-service")}
                          className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          Terms of Service
                        </button>
                        <button
                          onClick={() => signOut()}
                          className="block w-full text-left px-4 py-2 text-red-500 hover:bg-red-100"
                        >
                          Log Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <button onClick={() => signIn("google")} className="text-gray-700 transition-all hover:text-black">
                      Login
                    </button>
                  </div>
                )}
              </div>
            </ul>
          </nav>
        </div>
      </header>

      <main className="flex-1 mt-[100px]">
        {renderPage()}
        {/* ChatBot에 session에서 가져온 accessToken 전달 */}
        {currentView === "chatbot" && accessToken && (
          <ChatBot accessToken={accessToken} />
        )}
      </main>
    </div>
  );
};

export default Header;
