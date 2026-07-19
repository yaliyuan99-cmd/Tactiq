import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * True only when real Supabase credentials are present. When false, the data
 * layer (`src/lib/api.ts`) falls back to localStorage so the site keeps working
 * before a backend project is connected.
 */
export const isSupabaseConfigured = Boolean(
  url && anonKey && !url.includes('YOUR-PROJECT') && !anonKey.includes('YOUR-ANON'),
);

/**
 * The Supabase client, or `null` when the project isn't configured yet.
 * Callers should check `isSupabaseConfigured` (or null) before using it.
 */
export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured
  ? createClient<Database>(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.info(
    '[Tactiq] Supabase is not configured — using local fallback storage. ' +
      'Copy .env.example to .env and add your project keys to enable the backend.',
  );
}
