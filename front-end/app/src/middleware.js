import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("token")?.value;

  const pathname = req.nextUrl.pathname;
console.log("1.this one::::"+pathname);
  if (!token &&  pathname!='/auth/login' &&  pathname!='/api/login' &&  pathname!='/api/register' && pathname!='/auth/register' && pathname!='/auth/login') {
  console.log("2.this one::::"+pathname);

    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!login|_next|favicon.ico).*)'], // protect all dashboard routes
     // matcher: ['/matdash-nextjs/((?!api|_next|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico)).*)'],

};