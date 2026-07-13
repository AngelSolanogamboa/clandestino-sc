import { NextResponse } from 'next/server'

export function middleware(request) {
  const session = request.cookies.get('session')?.value
  const { pathname } = request.nextUrl

  // Rutas del dashboard protegidas
  const isDashboard = pathname.startsWith('/dashboard')

  if (isDashboard && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Si ya está logueado y va al login, redirigir al dashboard
  if (pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}