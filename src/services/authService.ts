import { RocketChatProvider } from "../infrastructure/providers/rocketChatProvider";
import { AuthSecrets } from "../core/auth/authSecrets";
import { askInput } from "../wrappers/askInput";
import { AuthSettings } from "../core/auth/authSettings";
import { cacheRepoContext } from "./cacheRepoContext";

export const authService = {
  async create() {
    let serverUrl = AuthSettings.getServerUrl();
    if (!serverUrl) {
      serverUrl = await askInput("Your Server URL");
      if (!serverUrl) {
        throw new Error("Server URL is required.");
      }
      AuthSettings.setServerUrl(serverUrl);
    }

    const provider = new RocketChatProvider(serverUrl);

    const authToken = await AuthSecrets.getAuthToken();
    const userId = await AuthSecrets.getUserId();
    if (authToken && userId) {
      await provider.login({ resume: authToken });
    } else {
      const patToken = await askInput("Your PAT Token");
      if (!patToken) {
        throw new Error("PAT Token is required.");
      }
      await provider.login({ resume: patToken });
    }

    await cacheRepoContext(serverUrl);

    return provider;
  },
};
