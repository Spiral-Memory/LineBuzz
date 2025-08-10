import * as vscode from "vscode";
import { SecretStorage } from "../../store/secretStorage";

export class AuthSecrets {
  static async setAuthToken(token: string) {
    await SecretStorage.store("authToken", token);
  }

  static async getAuthToken(): Promise<string | undefined> {
    return SecretStorage.get("authToken");
  }

  static async deleteAuthToken() {
    await SecretStorage.delete("authToken");
  }

  static async setUserId(id: string) {
    await SecretStorage.store("userId", id);
  }

  static async getUserId(): Promise<string | undefined> {
    return SecretStorage.get("userId");
  }

  static async deleteUserId() {
    await SecretStorage.delete("userId");
  }
}
