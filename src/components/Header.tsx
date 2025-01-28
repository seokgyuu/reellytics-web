"use client";

import React, { useState } from "react";
import { signOut, signIn } from "next-auth/react";
import { Session } from "next-auth";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermOfService from "@/pages/term-of-service";
import Profile from "@/components/Profile";

interface NavProps {
  currentView: string;
  onNavClick: (view: string) => void;
  session: Session | null;
  children: React.ReactNode;
}

const Header: React.FC<NavProps> = ({ currentView, onNavClick, session, children }) => {
  const [activePage, setActivePage] = useState<string>("");

  const renderPage = () => {
    if (activePage === "privacy-policy") return <PrivacyPolicy />;
    if (activePage === "term-of-service") return <TermOfService />;
    if (activePage === "profile") return <Profile />;
    return children;
  };

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

              <li className="ml-6 relative group">
                <span className="text-gray-700 cursor-pointer hover:underline">
                  Terms of Use
                </span>
                <div
                  className="absolute left-0 mt-2 hidden group-hover:flex flex-col bg-white border border-gray-200 p-4 shadow-md rounded z-10"
                  onMouseEnter={(e) => e.currentTarget.classList.add("flex")}
                  onMouseLeave={(e) => e.currentTarget.classList.remove("flex")}
                >
                  <button
                    onClick={() => setActivePage("privacy-policy")}
                    className="text-gray-700 hover:text-black transition-all mb-2"
                  >
                    Privacy Policy
                  </button>
                  <button
                    onClick={() => setActivePage("term-of-service")}
                    className="text-gray-700 hover:text-black transition-all"
                  >
                    Terms of Service
                  </button>
                </div>
              </li>

              <li className="ml-6">
                {session ? (
                  <div className="flex items-center space-x-4">
                    <span
                      className="text-gray-700 cursor-pointer hover:underline"
                      onClick={() => setActivePage("profile")}
                    >
                      {session.user?.name} 환영합니다.
                    </span>

                    <button
                      onClick={() => signOut()}
                      className="text-red-500 hover:text-red-700 transition-all"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => signIn("google")}
                      className="text-gray-700 transition-all hover:text-black"
                    >
                      Login
                    </button>
                  </div>
                )}
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="flex-1 mt-[100px]">{renderPage()}</main>
    </div>
  );
};

export default Header;
