import React, { useState } from "react";

interface HistoryItem {
  id: number;
  title?: string;
  created_at: string;
  updated_at: string;
  content_type: string;
  content: { [key: string]: number };
}

interface HistoryProps {
  chatHistory: HistoryItem[];
  onChatSelect: (chat: HistoryItem) => void;
  onTitleUpdate: (chatId: number, newTitle: string) => void;
}

const History: React.FC<HistoryProps> = ({ chatHistory, onChatSelect, onTitleUpdate }) => {
  const [editTitle, setEditTitle] = useState<{ id: number; title: string } | null>(null);

  const handleEdit = (id: number, currentTitle: string) => {
    setEditTitle({ id, title: currentTitle });
  };

  const handleSave = () => {
    if (editTitle) {
      onTitleUpdate(editTitle.id, editTitle.title);
      setEditTitle(null);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Chat History</h2>
      {chatHistory && Array.isArray(chatHistory) && chatHistory.length > 0 ? (
        <ul className="space-y-3">
          {chatHistory.map((history) => (
            <li key={history.id} className="p-3 border border-gray-300 rounded-md">
              <p className="font-medium">채팅 ID: {history.id}</p>
              <p>생성일: {new Date(history.created_at).toLocaleString()}</p>
              <p>업데이트일: {new Date(history.updated_at).toLocaleString()}</p>
              <p>내용 유형: {history.content_type}</p>

              {editTitle?.id === history.id ? (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    value={editTitle.title}
                    onChange={(e) => setEditTitle({ id: editTitle.id, title: e.target.value })}
                    className="border rounded p-1 flex-grow"
                  />
                  <button
                    onClick={handleSave}
                    className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
                  >
                    저장
                  </button>
                </div>
              ) : (
                <>
                  <p>제목: {history.title || "제목 없음"}</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(history.id, history.title || "")}
                      className="text-blue-500 underline"
                    >
                      제목 수정
                    </button>
                    <button
                      onClick={() => onChatSelect(history)}
                      className="text-green-500 underline"
                    >
                      상세 보기
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>데이터가 없습니다.</p>
      )}
    </div>
  );
};

export default History;
