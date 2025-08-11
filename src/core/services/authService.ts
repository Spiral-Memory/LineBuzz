import { RocketChatProvider } from "../../infrastructure/providers/rocketChatProvider";
import { AuthSecrets } from "../../core/auth/authSecrets";
import { askInput } from "../../wrappers/askInput";
import { AuthSettings } from "../../core/auth/authSettings";
import { cacheRepoContext } from "../../core/services/cacheRepoContext";

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
      await provider.login({ user: "", resume: authToken });
    } else {
      const email = await askInput("Your email");
      if (!email) {
        throw new Error("Email is required.");
      }

      const password = await askInput("Your password", { password: true });
      if (!password) {
        throw new Error("Password is required.");
      }

      await provider.login({ user: email, password });
    }

    await cacheRepoContext(serverUrl);

    return provider;
  },
};
