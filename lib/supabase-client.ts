import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types/database';

// Debug logging
console.log('[SUPABASE-CLIENT] Initializing Supabase client...');
console.log('[SUPABASE-CLIENT] Environment check:', {
  hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
});

// Create a custom Supabase client without realtime for static export
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[SUPABASE-CLIENT] Missing environment variables!');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Not set');
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  }
});

// Export createClient function
export function createClient() {
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false
    }
  });
}

console.log('[SUPABASE-CLIENT] Supabase client created successfully');

// Re-export types from the main supabase file
export type { Profile, Topic, BusinessModelDB, Comment, Upvote, Collection } from './supabase';
