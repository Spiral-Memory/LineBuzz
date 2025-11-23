import { createClient, SupabaseClient as SupabaseJsClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "../../core/platform/config";
import { VSCodeSupabaseStorage } from "./VSCodeSupabaseStorage";

export class SupabaseClient {
  private static instance: SupabaseClient;
  public readonly client: SupabaseJsClient;

  private constructor() {
    this.client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: new VSCodeSupabaseStorage(),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }

  public static getInstance(): SupabaseClient {
    if (!SupabaseClient.instance) {
      SupabaseClient.instance = new SupabaseClient();
    }
    return SupabaseClient.instance;
  }
}
