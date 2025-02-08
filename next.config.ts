const nextConfig = {
  reactStrictMode: true,
  output: "export",
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    KEYCLOAK_ID: process.env.KEYCLOAK_ID,
    KEYCLOAK_SECRET: process.env.KEYCLOAK_SECRET,
    KEYCLOAK_ISSUER: process.env.KEYCLOAK_ISSUER,
  },
};

export default nextConfig;
