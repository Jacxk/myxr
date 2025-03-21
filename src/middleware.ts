import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { middleware as meroute, config as meconfig } from "./app/user/me/middleware";

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  console.log(path)

  if (path.startsWith(meconfig.path)) {
    return meroute(req);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
