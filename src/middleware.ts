import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Liste des chemins publics qui ne nécessitent pas d'authentification
const publicPaths = ['/login', '/', '/legal']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // IMPORTANT: Vérifier si c'est un chemin public AVANT tout appel Supabase
  // Cela évite des appels auth inutiles pour les pages publiques
  const isPublicPath = publicPaths.includes(pathname)

  // Créer la réponse de base
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Créer le client Supabase
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
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

  // Vérifier l'auth uniquement si nécessaire
  // Pour les pages protégées ou pour rediriger les users connectés depuis les pages publiques
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Utilisateur connecté essayant d'accéder à une page publique (Login ou Home)
  // -> Redirection vers /stages
  if (user && isPublicPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/stages'
    return NextResponse.redirect(url)
  }

  // 2. Utilisateur NON connecté essayant d'accéder à une page PROTÉGÉE
  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match ONLY pages that need auth check.
     * Exclude:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, icons, manifest, sw.js (PWA files)
     * - api routes (handled separately)
     * - assets folder
     * - any file with extension (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|assets|api|sw.js|workbox-|manifest.json|offline.html|.*\\..*).*)',
  ],
}
