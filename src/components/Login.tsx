'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

const Login = () => {
  const { data: session } = useSession();
  const [apiResponse, setApiResponse] = useState(null);

  const handleLogin = async () => {
    await signIn('keycloak');
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div>
      {!session ? (
        <button onClick={handleLogin} className="px-4 py-2 bg-blue-500 text-white rounded">
          Keycloak으로 로그인
        </button>
      ) : (
        <div>
          <p>환영합니다, {session.user?.name}님</p>
          <p>이메일: {session.user?.email}</p>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded">
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
};

export default Login;
