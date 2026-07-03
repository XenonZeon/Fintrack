import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";

const PUBLIC_PATHS = ["/", "/health"];
const DEV_SKIP_AUTH = process.env.NODE_ENV !== "production" && process.env.DEV_SKIP_AUTH === "true";

const authMiddleware = auth.middleware({
  loginUrl: "/auth/sign-in",
});

export default function proxy(request: NextRequest) {
  if (
    DEV_SKIP_AUTH ||
    PUBLIC_PATHS.includes(request.nextUrl.pathname) ||
    request.headers.has("next-action")
  ) {
    return NextResponse.next();
  }
  return authMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|auth|_next/static|_next/image|favicon.ico).*)"],
};
