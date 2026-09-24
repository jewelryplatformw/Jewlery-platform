import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export const supabaseUrlValid = Boolean(supabaseUrl) && supabaseUrl !== 'https://placeholder.supabase.co';
export const supabaseKeyValid = Boolean(supabaseAnonKey) && supabaseAnonKey !== 'placeholder-key';
export const supabaseConfigured = supabaseUrlValid && supabaseKeyValid;

const fallbackUrl = 'https://placeholder.supabase.co';
const fallbackKey = 'placeholder-key';

export const supabase: SupabaseClient = createClient(
  supabaseUrl || fallbackUrl,
  supabaseAnonKey || fallbackKey,
  { auth: { persistSession: true } }
);
