import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types/database';

// Create a custom Supabase client for static export
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create client with auth persistence enabled for client-side auth
export const supabase = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'nichenext-auth',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-application-name': 'nichenext'
    }
  },
  db: {
    schema: 'public'
  }
});

// Export createClient function
export function createClient() {
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      storageKey: 'nichenext-auth',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        'x-application-name': 'nichehunt'
      }
    },
    db: {
      schema: 'public'
    }
  });
}

// Re-export types from the main supabase file
export type { Profile, Topic, BusinessModelDB, Comment, Upvote, Collection } from './supabase';
