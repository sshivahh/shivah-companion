import { NextResponse, type NextRequest } from "next/server";

// Fast path only: no session cookie → go to the login page.
// The cookie itself is verified on the server for every page and action.
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/login") return NextResponse.next();
  if (!request.cookies.get("sc_session")?.value) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|manifest.webmanifest).*)"],
};
