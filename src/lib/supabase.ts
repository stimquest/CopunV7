import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// The 'as any' is a temporary workaround because createClient expects the URL and key to be strings,
// but they can be undefined if missing. The app should handle this gracefully if the client fails to initialize.
export const supabase = createClient<Database>(supabaseUrl as string, supabaseAnonKey as string)

    