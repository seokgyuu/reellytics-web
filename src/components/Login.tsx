// 'use client';

// import { signIn, signOut } from 'next-auth/react';
// import { NextAuthSession } from '@/utils/authOptions';

// export default function Login({
// 	session,
// }: {
// 	session: NextAuthSession | null;
// }) {
// 	if (session?.error) {
// 		console.log('Session error');
// 		signOut(); // 에러 발생 시 자동 로그아웃
// 	}

// 	if (session) {
// 		return (
// 			<div>
// 				<button onClick={() => signOut()}>Sign out</button>
// 				<div>
// 					<h1>Session</h1>
// 					<pre>{JSON.stringify(session, null, 2)}</pre>
// 				</div>
// 			</div>
// 		);
// 	}

// 	return (
// 		<div>
// 			<button
// 				onClick={() => {
// 					signIn('keycloak');
// 					console.log('Sign in');
// 				}}
// 			>
// 				Sign in
// 			</button>
// 		</div>
// 	);
// }
