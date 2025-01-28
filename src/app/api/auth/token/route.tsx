import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = await getToken({ req: request });

  if (!token) {
    return NextResponse.json({ error: "No token found" }, { status: 401 });
  }

  // 필요한 정보만 선택적으로 반환
  const filteredToken = {
    name: token.name,
    email: token.email,
    picture: token.picture,
    accessToken: token.accessToken,
    accessTokenExpires: token.accessTokenExpires,
  };

  return NextResponse.json(filteredToken);
}
