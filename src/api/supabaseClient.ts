import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl: string | undefined = process.env.SUPABASE_API_URL;
const supabaseKey: string | undefined = process.env.SUPABASE_KEY;

if (!supabaseKey || !supabaseUrl) {
  throw new Error("SUPABASE_API_URL or SUPABASE_KEY environment variables are not set");
}

export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseKey
);
