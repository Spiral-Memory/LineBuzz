import { IAuthRepository, AuthSession } from "../interfaces/IAuthRepository";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "../../core/platform/config";

export class SupabaseAuthRepository implements IAuthRepository {
  async exchangeTokenForSession(githubToken: string): Promise<AuthSession> {
    console.log(
      "[SupabaseAuthRepository] Initiating token exchange via Edge Function."
    );

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const { data, error } = await supabase.functions.invoke("auth-exchange", {
      body: { githubToken: githubToken }
    });

    if (error) {
      throw new Error("Failed to exchange GitHub token: " + error.message);
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.verifyOtp({
      email: data.supabase_email,
      token: data.supabase_otp,
      type: "email"
    });

    if (sessionError) {
      throw new Error("Failed to verify OTP: " + sessionError.message);
    }

    const accessToken = sessionData.session?.access_token;
    const refreshToken = sessionData.session?.refresh_token;
    const userName = sessionData.user?.user_metadata?.display_name || sessionData.user?.email;

    if (!accessToken || !refreshToken) {
      throw new Error("Missing access token or refresh token in Supabase session");
    }

    return {
      username: userName,
      access_token: accessToken,
      refresh_token: refreshToken
    };
  }
}
