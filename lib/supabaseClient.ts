// Supabase client used across the Felines app (browser + server components).
// Reads connection details from environment variables only — never hardcode
// API keys here. See .env.local for the expected variable names.
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Check that NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local."
  );
}

// Shared Supabase client instance for querying the database and handling auth.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
