import { createBrowserClient } from '@supabase/ssr';

// 認証対応のSupabaseクライアント
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        storageKey: 'nichenext-auth',
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        headers: {
          'x-application-name': 'nichenext'
        }
      },
      db: {
        schema: 'public'
      }
    }
  )
}
