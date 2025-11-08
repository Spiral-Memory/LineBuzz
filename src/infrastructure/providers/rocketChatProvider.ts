import { RocketChatApi } from "../api/rocketChatApi";
import { ChatProvider } from "./chatProvider";
import { AuthSecrets } from "../../core/auth/authSecrets";
import { askInput } from "../../wrappers/askInput";

export class RocketChatProvider implements ChatProvider {
  private api: RocketChatApi;

  constructor(host: string) {
    this.api = new RocketChatApi(host);
  }

  async login(credentials: { resume: string; code?: string }) {
    const res = await this.api.handleLogin(credentials);
    const authToken = res?.data?.authToken;
    const userId = res?.data?.userId;

    if (!authToken || !userId) {
      throw new Error("Login failed: Missing authToken or userId");
    }

    return { authToken, userId };
  }

  async sendMessage(text: string, threadId?: string) {
    const authToken = await AuthSecrets.getAuthToken();
    const userId = await AuthSecrets.getUserId();

    if (!authToken || !userId) {
      throw new Error("Missing authentication token or user ID");
    }

    return this.api.handleSendMessage(authToken, userId, text, threadId);
  }

  async getThreadMessages(threadId: string) {
    const authToken = await AuthSecrets.getAuthToken();
    const userId = await AuthSecrets.getUserId();

    if (!authToken || !userId) {
      throw new Error("Missing authentication token or user ID");
    }

    return this.api.getThreadMessage(authToken, userId, threadId);
  }

  async getMessageById(threadId: string) {
    const authToken = await AuthSecrets.getAuthToken();
    const userId = await AuthSecrets.getUserId();

    if (!authToken || !userId) {
      throw new Error("Missing authentication token or user ID");
    }

    return this.api.getMessageById(authToken, userId, threadId);
  }

  async loginWithSetupFlow(setup: boolean) {
    const storedToken = await AuthSecrets.getAuthToken();

    if (storedToken) {
      return this.login({ resume: storedToken });
    }

    if (setup) {
      const patToken = await askInput("Your PAT Token");
      if (!patToken) {
        throw new Error("PAT token is required for login.");
      }
      return this.login({ resume: patToken });
    }

    return undefined;
  }
}
