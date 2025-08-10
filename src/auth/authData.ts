import * as vscode from "vscode";

export class AuthData {
  private static secretStorage: vscode.SecretStorage;

  public static initialize(context: vscode.ExtensionContext) {
    AuthData.secretStorage = context.secrets;
  }

  static async setAuthToken(token: string) {
    await AuthData.secretStorage.store("authToken", token);
  }

  static async getAuthToken(): Promise<string | undefined> {
    return await AuthData.secretStorage.get("authToken");
  }

  static async setUserId(id: string) {
    await AuthData.secretStorage.store("userId", id);
  }

  static async getUserId(): Promise<string | undefined> {
    return await AuthData.secretStorage.get("userId");
  }

  static async deleteAuthToken() {
    await AuthData.secretStorage.delete("authToken");
  }

  static async deleteUserId() {
    await AuthData.secretStorage.delete("userId");
  }
}
