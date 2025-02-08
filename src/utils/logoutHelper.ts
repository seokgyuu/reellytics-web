import { JWT } from 'next-auth/jwt';

export async function doFinalSignoutHandshake(jwt: JWT) {
  const { id_token } = jwt;
  try {
    const params = new URLSearchParams();
    params.append('id_token_hint', String(id_token));
    const response = await fetch(
      `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/logout?${params.toString()}`
    );

    console.log('Completed post-logout handshake:', response.status, response.statusText);
  } catch (error) {
    console.error('Failed to perform post-logout handshake:', error);
  }
}
