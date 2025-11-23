import { SupportedStorage } from "@supabase/supabase-js";
import { Storage } from "../../core/platform/storage";

export class VSCodeSupabaseStorage implements SupportedStorage {
  async getItem(key: string): Promise<string | null> {
    const value = await Storage.getSecret(key);
    return value || null;
  }

  async setItem(key: string, value: string): Promise<void> {
    await Storage.setSecret(key, value);
  }

  async removeItem(key: string): Promise<void> {
    await Storage.deleteSecret(key);
  }
}
