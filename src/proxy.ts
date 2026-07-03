import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";

const PUBLIC_PATHS = ["/", "/health"];

const authMiddleware = auth.middleware({
  loginUrl: "/auth/sign-in",
});

export default function proxy(request: NextRequest) {
  if (PUBLIC_PATHS.includes(request.nextUrl.pathname)) {
    return NextResponse.next();
  }
  return authMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|auth|_next/static|_next/image|favicon.ico).*)"],
};
