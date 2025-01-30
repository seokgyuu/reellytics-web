import React, { useEffect, useState } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../utils/firebaseConfig';

const FirestoreTest: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');

  // Firestore에서 메시지 불러오기
  const fetchMessages = async () => {
    const messagesRef = collection(db, 'test_messages');
    const querySnapshot = await getDocs(messagesRef);
    const loadedMessages = querySnapshot.docs.map((doc) => doc.data().text);
    setMessages(loadedMessages);
  };

  // Firestore에 메시지 저장하기
  const addMessageToFirestore = async () => {
    if (!newMessage.trim()) return;
    const messagesRef = collection(db, 'test_messages');
    await addDoc(messagesRef, { text: newMessage });
    setNewMessage('');
    fetchMessages();  // 저장 후 메시지 갱신
  };

  useEffect(() => {
    fetchMessages();  // 초기 로드 시 Firestore 데이터 불러오기
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Firestore 테스트</h1>
      <div className="mb-4">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="메시지를 입력하세요"
          className="border p-2 rounded w-full"
        />
        <button onClick={addMessageToFirestore} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
          메시지 추가
        </button>
      </div>
      <div>
        <h2 className="text-lg font-semibold">저장된 메시지:</h2>
        <ul>
          {messages.map((message, index) => (
            <li key={index} className="border-b py-2">
              {message}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FirestoreTest;
