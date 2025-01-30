import React from "react";
import { signIn, signOut, useSession } from "next-auth/react";

const Login: React.FC = () => {
  const { data: session } = useSession();

  const handleLogin = async () => {
    await signIn("google");
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="p-4 bg-gray-100 rounded-md shadow-md">
      {!session ? (
        <button
          onClick={handleLogin}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Sign In with Google
        </button>
      ) : (
        <div>
          <p>환영합니다, {session.user?.name}님</p>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default Login;
