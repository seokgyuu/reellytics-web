import React, { useState } from "react";

interface HistoryItem {
  id: number;
  title: string;
  updated_at: string;
}

interface HistoryProps {
  chatHistory: HistoryItem[];
  onTitleUpdate: (chatId: number, newTitle: string) => void;
}

const History: React.FC<HistoryProps> = ({ chatHistory, onTitleUpdate }) => {
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
              <p>업데이트: {new Date(history.updated_at).toLocaleString()}</p>
              {editTitle?.id === history.id ? (
                <div className="flex items-center gap-2">
                  <input
                      type="text"
                      value={editTitle?.title || ""}  
                      onChange={(e) => setEditTitle({ ...editTitle, title: e.target.value })}
                      className="border rounded p-1 flex-grow"
                    />
                  <button
                    onClick={handleSave}
                    className="ml-2 px-4 py-2 bg-black text-white rounded-2xl hover:bg-gray-800 transition disabled:bg-gray-400"
                  >
                    저장
                  </button>
                </div>
              ) : (
                <>
                  <p>제목: {history.title}</p>
                  <button
                    onClick={() => handleEdit(history.id, history.title)}
                    className="text-blue-500 underline"
                  >
                    제목 수정
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default History;
