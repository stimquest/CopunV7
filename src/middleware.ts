import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Liste des chemins publics qui ne nécessitent pas d'authentification
  const publicPaths = ['/login', '/', '/legal']

  // Chemins à ignorer (fichiers statiques, etc.)
  const ignoredPaths = [
    '/_next',
    '/api',
    '/assets',
    '/favicon.ico',
    '/manifest.json',
    '/sw.js',
    '/workbox-',
  ]

  const { pathname } = request.nextUrl

  // Si le chemin est ignoré, on laisse passer
  if (ignoredPaths.some(path => pathname.startsWith(path))) {
    return response
  }

  // 1. Utilisateur connecté essayant d'accéder à une page publique (Login ou Home)
  // -> Redirection vers /stages
  if (user && publicPaths.includes(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/stages'
    return NextResponse.redirect(url)
  }

  // 2. Utilisateur NON connecté essayant d'accéder à une page PROTÉGÉE
  // (Tout ce qui n'est PAS public et PAS ignoré)
  if (!user && !publicPaths.includes(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
