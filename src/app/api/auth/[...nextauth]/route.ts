import NextAuth, { NextAuthOptions, Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import KeycloakProvider from 'next-auth/providers/keycloak';

async function refreshAccessToken(token: JWT) {
	try {
		const url = `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`;
		const body = {
			grant_type: 'refresh_token',
			client_id: process.env.KEYCLOAK_ID as string,
			client_secret: process.env.KEYCLOAK_SECRET as string,
			refresh_token: token.refreshToken as string,
		};
		const urlencoded = new URLSearchParams(body);

		const response = await fetch(url, {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			method: 'POST',
			body: urlencoded,
		});

		const refreshedTokens = await response.json();

		if (!response.ok) throw refreshedTokens;

		return {
			...token,
			accessToken: refreshedTokens.access_token,
			accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
			refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, 
		};
	} catch (error) {
		console.error(error);
		

		return {
			...token,
			error: 'RefreshAccessTokenError',
		};
	}
}

async function doFinalSignoutHandshake(jwt: JWT) {
	const { id_token } = jwt;

	try {
		const params = new URLSearchParams();
		params.append('id_token_hint', String(id_token));
		const { status, statusText } = await fetch(
			`${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/logout?${params.toString()}`,
		);

		console.log('Completed post-logout handshake', status, statusText);
	} catch (e: any) {
		console.error('Unable to perform post-logout handshake', e?.code || e);
	}
}

export const authOptions: NextAuthOptions = {
	secret: process.env.NEXTAUTH_SECRET,
	providers: [
		KeycloakProvider({
			clientId: process.env.KEYCLOAK_ID as string,
			clientSecret: process.env.KEYCLOAK_SECRET as string,
			
			issuer: process.env.KEYCLOAK_ISSUER,
		}),
	],

	callbacks: {
		async jwt({ token, user, account }) {
			// Initial sign in
			if (user && account && account.expires_at) {
				return {
					accessToken: account.access_token,
					accessTokenExpires: Date.now() + account.expires_at * 1000,
					refreshToken: account.refresh_token,
					id_token: account.id_token,
					user,
				};
			}

			const accessTokenExpires = token.accessTokenExpires as number;
			if (Date.now() > accessTokenExpires) {
				return token;
			}

			return refreshAccessToken(token);
		},
		async session({ session, token }: NextAuthSessionProps) {
			if (token) {
				session.user = token.user as {
					name?: string | null | undefined;
					email?: string | null | undefined;
					image?: string | null | undefined;
				};
				session.accessToken = token.accessToken;
				session.error = token.error;
			}

			return session;
		},
	},
	events: {
		signOut: message => doFinalSignoutHandshake(message.token),
	},
};

interface NextAuthSessionProps {
	session: NextAuthSession;
	token: JWT;
}
export interface NextAuthSession extends Session {
	accessToken?: unknown;
	error?: unknown;
	user?: {
		name?: string | null | undefined;
		email?: string | null | undefined;
		image?: string | null | undefined;
	};
}

export const handler: NextAuthOptions = NextAuth(authOptions);
export { handler as GET, handler as POST };
