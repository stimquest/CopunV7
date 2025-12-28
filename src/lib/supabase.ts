import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

// Création lazy du client Supabase pour éviter les erreurs pendant le build
// Le client n'est créé qu'au premier appel de getSupabase()
let supabaseInstance: ReturnType<typeof createBrowserClient<Database>> | null = null;

function getSupabaseClient() {
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Vérification explicite pour un meilleur message d'erreur
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase credentials missing: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required'
    );
  }

  // Configuration optimisée pour les performances
  // Note: Realtime désactivé car non utilisé - économise du compute
  supabaseInstance = createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      },
      global: {
        headers: {
          'x-my-custom-header': 'copun-de-la-mer',
        },
      },
      // Désactiver realtime pour économiser les ressources
      // (pas de subscriptions utilisées dans l'app)
      realtime: {
        params: {
          eventsPerSecond: 0, // Désactivé
        },
      },
    }
  );

  return supabaseInstance;
}

// Export un proxy qui créé le client seulement quand il est utilisé
// Ceci évite l'erreur pendant le build Netlify
export const supabase = new Proxy({} as ReturnType<typeof createBrowserClient<Database>>, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

