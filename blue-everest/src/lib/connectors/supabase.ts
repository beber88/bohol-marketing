// src/lib/connectors/supabase.ts
// Supabase client setup for Blue Everest marketing platform

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Placeholder for generated Supabase types.
 * Run `npx supabase gen types typescript` against your project
 * and replace this with the generated output.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Database {
  public: {
    Tables: Record<string, unknown>;
    Views: Record<string, unknown>;
    Functions: Record<string, unknown>;
    Enums: Record<string, unknown>;
  };
}

let anonClient: SupabaseClient | null = null;
let adminClient: SupabaseClient | null = null;

/**
 * Create (or return cached) anon Supabase client.
 * Uses the public URL and anon key - safe for client-side use.
 */
export function createSupabaseClient(): SupabaseClient | null {
  if (anonClient) return anonClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.warn(
      '[supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
        'Supabase client will not be available.'
    );
    return null;
  }

  anonClient = createClient(url, anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  });

  return anonClient;
}

/**
 * Create (or return cached) admin Supabase client.
 * Uses the service role key - server-side only, bypasses RLS.
 */
export function createSupabaseAdmin(): SupabaseClient | null {
  if (adminClient) return adminClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // If service role key available, use it (bypasses RLS)
  if (url && serviceRoleKey) {
    adminClient = createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    return adminClient;
  }

  // Fallback: use anon key (works with RLS policies we set up)
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && anonKey) {
    adminClient = createClient(url, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    return adminClient;
  }

  console.warn('[supabase] No Supabase credentials available.');
  return null;
}
