"use client";

import React from "react";

interface NavProps {
  currentView: string;
  onNavClick: (view: string) => void;
  children: React.ReactNode;
}

const Header: React.FC<NavProps> = ({ currentView, onNavClick, children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="header fixed top-0 left-0 w-full bg-white bg-opacity-90 backdrop-blur-md shadow-md z-50">
        <div className="header__inner flex justify-between items-center p-4 max-w-screen-xl mx-auto">
          <div className="header__logo text-lg font-bold">
            <a href="#" className="text-gray-800">
              REELLYTICS
            </a>
          </div>
          <nav className="header__nav">
            <ul className="flex items-center">
              {["chatbot", "login", "profile"].map((view) => (
                <li key={view} className="ml-6">
                  <a
                    href="#"
                    onClick={() => onNavClick(view)}
                    className={`flex items-center text-gray-700 transition-all ${
                      currentView === view ? "text-blue-500" : "hover:text-black"
                    }`}
                  >
                    {view.charAt(0).toUpperCase() + view.slice(1)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main className="flex-1 mt-[100px]">{children}</main>
    </div>
  );
};

export default Header;
