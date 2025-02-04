"use client";

import React from "react";

interface HistoryItem {
  id: number;
  title: string;
  updated_at: string;
}

interface HistoryProps {
  chatHistory: HistoryItem[];
}

const History: React.FC<HistoryProps> = ({ chatHistory }) => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">History</h2>
      {chatHistory.length === 0 ? (
        <p>데이터가 없습니다.</p>
      ) : (
        <ul className="space-y-3">
          {chatHistory.map((history) => (
            <li
              key={history.id}
              className="p-3 border border-gray-300 rounded-md shadow-sm hover:bg-gray-100"
            >
              <p className="font-medium">ID: {history.id}</p>
              <p>제목: {history.title}</p>
              <p>업데이트: {new Date(history.updated_at).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default History;
