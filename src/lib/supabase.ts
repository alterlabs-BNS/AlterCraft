import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Shared Supabase client for the AlterCraft storefront.
 *
 * URL + anon key come from Vite env (`.env.local`). Both are safe to ship to the
 * browser — row-level security in the database (see
 * `supabase/migrations/20260723120000_store_core.sql`) is what actually protects
 * data. The service-role key is NEVER used here; it lives only in server-side
 * Edge Functions (Razorpay order creation / webhook).
 *
 * Until the two env vars are set, `supabase` is `null` and all data helpers
 * degrade gracefully (return empty / no-op) so the app never crashes.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured && import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.warn(
    '[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set. ' +
      'Copy .env.example to .env.local and fill them in — catalogue/leads calls no-op until then.',
  );
}

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;
