import { ChatProvider, LoginCredentials } from "../providers/chatProvider";

export class AuthManager {
  constructor(private provider: ChatProvider) {}

  async login(credentials: LoginCredentials) {
    return this.provider.login(credentials);
  }
}
