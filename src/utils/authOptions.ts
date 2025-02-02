// import { JWT } from 'next-auth/jwt';

// interface ExtendedJWT extends JWT {
//   accessToken?: string;
//   refreshToken?: string;
//   accessTokenExpires?: number;
//   error?: string;
// }

// export const authOptions = {
//   callbacks: {
//     async jwt({ token, account }: { token: ExtendedJWT; account: any }) {
//       if (account) {
//         token.accessToken = account.access_token;
//       }
//       return token;
//     },
//     async session({ session, token }: { session: any; token: ExtendedJWT }) {
//       session.accessToken = token.accessToken;
//       return session;
//     },
//   },
// };
