import { RocketChatApi } from "../api/api";
import { ChatProvider, LoginCredentials } from "./chatProvider";
import { AuthData } from "../auth/authData";

export class RocketChatProvider implements ChatProvider {
  private api: RocketChatApi;

  constructor(host: string) {
    this.api = new RocketChatApi(host);
  }

  async login(credentials: LoginCredentials) {
    const res = await this.api.handleLogin(credentials);
    const authToken = res?.data?.authToken;
    const userId = res?.data?.userId;

    if (!authToken || !userId) {
      throw new Error("Login failed: Missing authToken or userId");
    }

    AuthData.setAuthToken(authToken);
    AuthData.setUserId(userId);

    return { authToken, userId };
  }

  async sendMessage(text: string, threadId?: string) {
    return this.api.handleSendMessage(
      AuthData.getAuthToken(),
      AuthData.getUserId(),
      text,
      threadId
    );
  }

  async getThreadMessages(threadId: string) {
    return this.api.getThreadMessage(
      AuthData.getAuthToken(),
      AuthData.getUserId(),
      threadId
    );
  }

  async getParentMessage(threadId: string) {
    return this.api.getParentMessage(
      AuthData.getAuthToken(),
      AuthData.getUserId(),
      threadId
    );
  }
}
