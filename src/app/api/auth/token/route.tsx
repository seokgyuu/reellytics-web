//토큰 테스트
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = await getToken({ req: request });

  if (!token) {
    return NextResponse.json({ error: "No token found" }, { status: 401 });
  }

  const filteredToken = {
    name: token.name,
    email: token.email,
    picture: token.picture,
    accessToken: token.accessToken,
    refreshToken: token.refreshToken,
    accessTokenExpires: token.accessTokenExpires,
  };

  return NextResponse.json(filteredToken);
}
