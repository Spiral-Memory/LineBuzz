import { IAuthRepository, AuthSession } from "../interfaces/IAuthRepository";
import { SupabaseClient } from "./SupabaseClient";
import { logger } from "../../core/utils/logger";

export class SupabaseAuthRepository implements IAuthRepository {
  async exchangeTokenForSession(githubToken: string): Promise<AuthSession> {

    const supabase = SupabaseClient.getInstance().client;

    const { data: currentSession } = await supabase.auth.getSession();
    if (currentSession.session) {
      logger.info("SupabaseAuthRepository", "Found existing session.")
      return this.extractSessionData(currentSession.session);
    }

    logger.info("SupabaseAuthRepository", "Initiating token exchange via Edge Function.");

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

    if (!sessionData.session) {
      throw new Error("Missing session data after OTP verification");
    }

    return this.extractSessionData(sessionData.session);
  }

  async signOut(): Promise<void> {
    logger.info("SupabaseAuthRepository", "Clearing Supabase session.");
    const supabase = SupabaseClient.getInstance().client;
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase.auth.signOut();
      logger.info("SupabaseAuthRepository", "Signed out successfully.");
    } else {
      logger.info("SupabaseAuthRepository", "No active session found to sign out.");
    }
  }

  private extractSessionData(session: any): AuthSession {
    const accessToken = session.access_token;
    const refreshToken = session.refresh_token;
    const userId = session.user?.id;
    const userName = session.user?.user_metadata?.display_name || session.user?.email;

    if (!accessToken || !refreshToken) {
      throw new Error("Missing access token or refresh token in Supabase session");
    }

    return {
      user_id: userId,
      username: userName,
      access_token: accessToken,
      refresh_token: refreshToken
    };
  }
}
