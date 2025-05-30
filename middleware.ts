import { createClient } from "@/lib/supabase/middleware"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request)

  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check auth condition
  if (!session && !request.nextUrl.pathname.startsWith("/auth")) {
    // Auth condition not met, redirect to login page
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = "/login"
    redirectUrl.searchParams.set("redirectedFrom", request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Auth condition met, forward request along with session
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - auth (auth endpoints)
     * - api (API routes)
     * - / (home page)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|login|register|auth/callback|auth/auth-code-error|api|$).*)",
  ],
}
