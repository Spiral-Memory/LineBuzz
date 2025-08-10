import * as vscode from "vscode";

export class SecretStorage {
  private static secretStorage: vscode.SecretStorage;

  public static initialize(context: vscode.ExtensionContext) {
    SecretStorage.secretStorage = context.secrets;
  }

  public static async store(key: string, value: string) {
    await SecretStorage.secretStorage.store(key, value);
  }

  public static async get(key: string): Promise<string | undefined> {
    return SecretStorage.secretStorage.get(key);
  }

  public static async delete(key: string) {
    await SecretStorage.secretStorage.delete(key);
  }
}
