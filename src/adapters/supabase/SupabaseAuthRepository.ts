import { IAuthRepository, AuthSession } from "../interfaces/IAuthRepository";
import { SUPABASE_URL } from "../../core/platform/config";

export class SupabaseAuthRepository implements IAuthRepository {
  async exchangeTokenForSession(githubToken: string): Promise<AuthSession> {
    console.log(
      "[SupabaseAuthRepository] Initiating token exchange via Edge Function."
    );

    const response = await fetch(SUPABASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ githubToken }),
    });

    if (!response.ok) {
      let errorDetails = "Unknown authentication error.";
      try {
        const errorData = await response.json();
        errorDetails = errorData.error || errorDetails;
      } catch (e) {}

      console.error(
        `Edge Function failed with status ${response.status}: ${errorDetails}`
      );
      throw new Error(`Authentication Exchange Failed: ${errorDetails}`);
    }

    const data: {
      access_token: string;
      user_id: string;
    } = await response.json();

    return {
      access_token: data.access_token,
      user_id: data.user_id,
    };
  }
}
