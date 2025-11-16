// FILE: middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ============================================
// Added: Request logging + performance timer
// ============================================

export async function middleware(request: NextRequest) {
  const startTime = Date.now()

  // Initial response (needed for Supabase)
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Supabase client setup
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Check auth status
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(
      new URL(`/login?redirectedFrom=${request.nextUrl.pathname}`, request.url)
    )
  }

  // Auth pages: redirect if logged in
  if (['/login', '/register'].includes(request.nextUrl.pathname) && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // ============================================
  // Add performance monitoring + header
  // ============================================
  response.headers.set('X-Request-Start', startTime.toString())

  if (process.env.NODE_ENV === 'development') {
    const duration = Date.now() - startTime
    if (duration > 1000) {
      console.warn(
        `[Middleware] Slow request: ${request.nextUrl.pathname} (${duration}ms)`
      )
    }
  }

  return response
}

// ============================================
// Combined matcher from BOTH versions
// ============================================

export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
    '/login',
    '/register',
    '/onboarding',
  ],
}
