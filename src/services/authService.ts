import * as vscode from "vscode";
import { AuthSecrets } from "../core/auth/authSecrets";
import { askInput } from "../wrappers/askInput";
import { AuthSettings } from "../core/auth/authSettings";
import { RocketChatProvider } from "../infrastructure/providers/rocketChatProvider";
import { ChatProvider } from "../infrastructure/providers/chatProvider";

export const authService = {
  async initialize(providerName: string, setup = false) {
    let serverUrl = AuthSettings.getServerUrl();

    if (setup) {
      serverUrl = await askInput("Workspace Server URL");
      if (!serverUrl) {
        throw new Error("Server URL is required to connect.");
      }
    }

    if (!serverUrl) {
      return;
    }

    let provider: ChatProvider;
    if (providerName === "rocketchat") {
      provider = new RocketChatProvider(serverUrl);
    } else {
      vscode.window.showErrorMessage(`Unsupported provider: ${providerName}`);
      throw new Error(`Unsupported provider: ${providerName}`);
    }

    try {
      const loginResult = await provider.loginWithSetupFlow(setup);
      if (!loginResult) {
        return;
      }

      AuthSettings.setServerUrl(serverUrl);
      AuthSettings.setProviderName(providerName);
      await AuthSecrets.setAuthToken(loginResult.authToken);
      await AuthSecrets.setUserId(loginResult.userId);

      return provider;
    } catch {
      throw new Error(`Failed to authenticate with ${providerName}.`);
    }
  },
};
