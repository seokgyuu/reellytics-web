"use client";

import { signIn, signOut } from "next-auth/react";
import { NextAuthSession } from "@/utils/authOptions";

export default function Login({ session }: { session: NextAuthSession | null }) {
  const handleSignOut = async () => {
    try {
      // NextAuth 로그아웃
      await signOut({ redirect: false });

      // 로컬 스토리지와 세션 스토리지 삭제
      localStorage.clear();
      sessionStorage.clear();
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);
    }
  };
  
  if (session?.error) {
    handleSignOut();
  }

  if (session) {
    return (
      <div className="p-4 bg-gray-100 rounded-md shadow-md">
        <h1 className="text-lg font-semibold mb-4">Logged In</h1>
        <button
          className="mb-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={handleSignOut}
        >
          Sign Out
        </button>
        <div>
          <h2 className="text-sm font-medium mb-2">정보 :</h2>
          <pre className="bg-gray-50 p-2 rounded text-sm">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-100 rounded-md shadow-md">
      <h1 className="text-lg font-semibold mb-4">Welcome</h1>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={() => signIn("google")}
      >
        Sign In with Google
      </button>
    </div>
  );
}
