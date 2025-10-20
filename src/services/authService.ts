import * as vscode from "vscode";
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

    try {
      if (authToken) {
        await provider.login({ resume: authToken });
      } else {
        throw new Error("No stored authentication token found.");
      }
    } catch {
      AuthSecrets.deleteAuthToken();
      const patToken = await askInput("Your PAT Token");
      if (!patToken) {
        vscode.window.showErrorMessage(
          "Please provide a valid PAT token to continue."
        );
      } else {
        try {
          await provider.login({ resume: patToken });
        } catch (error) {
          vscode.window.showErrorMessage(
            "Login failed. Please check your PAT token and try again."
          );
          throw error;
        }
      }
    }

    await cacheRepoContext(serverUrl);

    return provider;
  },
};
