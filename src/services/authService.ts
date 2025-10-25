import { RocketChatProvider } from "../infrastructure/providers/rocketChatProvider";
import { AuthSecrets } from "../core/auth/authSecrets";
import { askInput } from "../wrappers/askInput";
import { AuthSettings } from "../core/auth/authSettings";

export const authService = {
  async initialize(setup = false) {
    let serverUrl = AuthSettings.getServerUrl();

    if (setup) {
      serverUrl = await askInput("Rocket.Chat Server URL");
      if (!serverUrl) {
        throw new Error("Server URL is required to connect.");
      }
    }

    if (!serverUrl) {
      return;
    }

    const provider = new RocketChatProvider(serverUrl);
    const storedToken = await AuthSecrets.getAuthToken();

    try {
      let loginResult;

      if (storedToken) {
        loginResult = await provider.login({ resume: storedToken });
      } else if (setup) {
        const patToken = await this._promptForToken();
        loginResult = await provider.login({ resume: patToken });
      } else {
        return;
      }

      AuthSettings.setServerUrl(serverUrl);
      await AuthSecrets.setAuthToken(loginResult.authToken);
      await AuthSecrets.setUserId(loginResult.userId);
      return provider;
    } catch {
      if (setup) {
        const patToken = await this._promptForToken();
        const loginResult = await provider.login({ resume: patToken });

        AuthSettings.setServerUrl(serverUrl);
        await AuthSecrets.setAuthToken(loginResult.authToken);
        await AuthSecrets.setUserId(loginResult.userId);

        return provider;
      }

      throw new Error("Failed to authenticate with Rocket.Chat");
    }
  },

  async _promptForToken() {
    const patToken = await askInput("Your PAT Token");
    if (!patToken) {
      throw new Error("PAT token is required for login.");
    }
    return patToken;
  },
};
