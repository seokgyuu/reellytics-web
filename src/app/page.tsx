"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import ChatBot from "@/components/ChatBot";

export default function Page() {
  const [currentView, setCurrentView] = useState<string>("chatbot");

  const handleNavClick = (view: string) => {
    setCurrentView(view);
  };

  return (
    <Header currentView={currentView} onNavClick={handleNavClick}>
      {currentView === "chatbot" && <ChatBot />}
      {currentView === "login" && (
        <div className="text-center">
          <h2 className="text-lg font-medium text-gray-700">Page</h2>
        </div>
      )}
      {currentView === "profile" && (
        <div className="text-center">
          <h2 className="text-lg font-medium text-gray-700">Page </h2>
        </div>
      )}
    </Header>
  );
}
