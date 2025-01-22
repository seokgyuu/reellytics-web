'use client';

import { signIn, signOut } from 'next-auth/react';
import { NextAuthSession } from '@/utils/authOptions';

export default function Login({
  session,
}: {
  session: NextAuthSession | null;
}) {
  // 세션 에러가 있는 경우 자동 로그아웃
  if (session?.error) {
    console.error('Session error detected:', session.error);
    signOut()
      .then(() => console.log('Logged out due to session error'))
      .catch((err) => console.error('Error during sign out:', err));
  }

  // 세션이 있는 경우
  if (session) {
    return (
      <div className="p-4 bg-gray-100 rounded-md shadow-md">
        <h1 className="text-lg font-semibold mb-4">Logged In</h1>
        <button
          className="mb-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={() =>
            signOut()
              .then(() => console.log('Logged out successfully'))
              .catch((err) => console.error('Error during sign out:', err))
          }
        >
          Sign Out
        </button>
        <div>
          <h2 className="text-sm font-medium mb-2">Session Details:</h2>
          <pre className="bg-gray-50 p-2 rounded text-sm">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  // 세션이 없는 경우
  return (
    <div className="p-4 bg-gray-100 rounded-md shadow-md">
      <h1 className="text-lg font-semibold mb-4">Welcome</h1>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={() =>
          signIn('keycloak')
            .then(() => console.log('Sign in initiated'))
            .catch((err) => console.error('Error during sign in:', err))
        }
      >
        Sign In with Keycloak
      </button>
    </div>
  );
}
