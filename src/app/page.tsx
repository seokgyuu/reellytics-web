import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import ChatBot from '@/components/ChatBot';
import Header from '@/components/Header';
import Login from '@/components/Login';

export default async function Page() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">Reellytics 로그인 테스트</h1>
        <Login session={session} />
        {session?.accessToken && <ChatBot accessToken={session.accessToken} />}
      </main>
    </div>
  );
}
