"use client";

import React, { useState } from "react";
import { fetchGPT } from "@/utils/fetchGPT";
import "@/style/chatbot.css"; 

export default function ChatBot() {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetchGPT(input);
      setMessages((prev) => [...prev, { sender: "GPT", text: response }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "GPT", text: "Error fetching response." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      <h1 className="chatbot-header">ReelStatics</h1>
      <div className="chatbot-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chatbot-message ${
              msg.sender === "user" ? "chatbot-user" : "chatbot-gpt"
            }`}
          >
            {msg.text}
          </div>
        ))}
        {isLoading && <div className="chatbot-typing">Typing...</div>}
      </div>
      <div className="chatbot-input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message"
          className="chatbot-input"
        />
        <button
          onClick={handleSend}
          className="chatbot-button"
          disabled={isLoading}
        >
          {isLoading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
