import { RocketChatApi } from "../api/rocketChatApi";
import { ChatProvider } from "./chatProvider";
import { AuthData } from "../auth/authData";

export class RocketChatProvider implements ChatProvider {
  private api: RocketChatApi;

  constructor(host: string) {
    this.api = new RocketChatApi(host);
  }

  async login(credentials: {
    user: string;
    password?: string;
    resume?: string;
    code?: string;
  }) {
    const res = await this.api.handleLogin(credentials);
    const authToken = res?.data?.authToken;
    const userId = res?.data?.userId;

    if (!authToken || !userId) {
      throw new Error("Login failed: Missing authToken or userId");
    }

    await AuthData.setAuthToken(authToken);
    await AuthData.setUserId(userId);

    return { authToken, userId };
  }

  async sendMessage(text: string, threadId?: string) {
    const authToken = await AuthData.getAuthToken();
    const userId = await AuthData.getUserId();

    if (!authToken || !userId) {
      throw new Error("Missing authentication token or user ID");
    }

    return this.api.handleSendMessage(authToken, userId, text, threadId);
  }

  async getThreadMessages(threadId: string) {
    const authToken = await AuthData.getAuthToken();
    const userId = await AuthData.getUserId();

    if (!authToken || !userId) {
      throw new Error("Missing authentication token or user ID");
    }

    return this.api.getThreadMessage(authToken, userId, threadId);
  }

  async getParentMessage(threadId: string) {
    const authToken = await AuthData.getAuthToken();
    const userId = await AuthData.getUserId();

    if (!authToken || !userId) {
      throw new Error("Missing authentication token or user ID");
    }

    return this.api.getParentMessage(authToken, userId, threadId);
  }
}
