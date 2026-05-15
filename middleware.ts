import NextAuth, { type NextAuthRequest } from "next-auth";
import { NextResponse } from "next/server";

import authConfig from "@/auth.config";

const protectedPrefixes = [
  "/oversikt",
  "/leads",
  "/kunder",
  "/pipeline",
  "/bokningar",
  "/uppgifter",
  "/konversationer",
  "/automationer",
  "/statistik",
  "/ai-assistent",
  "/team",
  "/fakturering",
  "/installningar",
  "/customers",
  "/ai-assistant",
];

const { auth } = NextAuth(authConfig);

export default auth((request: NextAuthRequest) => {
  const pathname = request.nextUrl.pathname;
  const isProtected = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  if (request.auth) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.nextUrl.origin);
  loginUrl.searchParams.set("callbackUrl", pathname);

  return NextResponse.redirect(loginUrl);
});

export const config = {
  matcher: ["/((?!api/public|api/auth|_next|favicon.ico|.*\\..*).*)"],
};
