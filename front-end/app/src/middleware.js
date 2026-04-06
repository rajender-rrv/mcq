import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const role = req.cookies.get("role")?.value;

  const pathname = req.nextUrl.pathname;

  console.log("Path:", pathname, "Role:", role);

  // ✅ Allow public routes
  const publicPaths = [
    "/auth/login",
    "/auth/register",
    "/api/login",
    "/api/register",
  ];

  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // ✅ If not logged in → redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // ✅ Admin trying user route → redirect to admin
  if (role === "admin" && !pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // ✅ User trying admin route → block
  if (role !== "admin" && pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/users/:path*",
    "/",
  ],
};



/*
NEWLY ADDED...
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const isAdmin = request.cookies.get("role")?.value === "admin";

  if (request.nextUrl.pathname.startsWith("/admin") && !isAdmin) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};


*/
