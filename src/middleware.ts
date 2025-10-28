import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/interview(.*)",
  "/dashboard(.*)",
  "/admin(.*)", // Protect admin routes
  "/api/trpc(.*)", // Protect API routes
]);

export default clerkMiddleware(async (auth, request) => {
  // Redirect all .vercel.app domains to main domain
  const hostname = request.headers.get("host") || "";
  if (hostname.includes(".vercel.app")) {
    const url = request.nextUrl.clone();
    url.host = "www.skillvee.com";
    url.protocol = "https:";
    return NextResponse.redirect(url, 308); // 308 = Permanent Redirect
  }

  if (isProtectedRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};