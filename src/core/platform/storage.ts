import * as vscode from "vscode";

export class Storage {
  private static globalState: vscode.Memento;
  private static workspaceState: vscode.Memento;
  private static secretStorage: vscode.SecretStorage;

  public static initialize(context: vscode.ExtensionContext) {
    this.globalState = context.globalState;
    this.workspaceState = context.workspaceState;
    this.secretStorage = context.secrets;
  }

  // Global
  public static setGlobal(key: string, value: any) {
    this.globalState.update(key, value);
  }

  public static getGlobal<T>(key: string): T | undefined {
    return this.globalState.get<T>(key);
  }

  public static deleteGlobal(key: string) {
    this.globalState.update(key, undefined);
  }

  // Workspace
  public static setWorkspace(key: string, value: any) {
    this.workspaceState.update(key, value);
  }

  public static getWorkspace<T>(key: string): T | undefined {
    return this.workspaceState.get<T>(key);
  }

  public static deleteWorkspace(key: string) {
    this.workspaceState.update(key, undefined);
  }

  // Secrets
  public static async setSecret(key: string, value: string) {
    await this.secretStorage.store(key, value);
  }

  public static async getSecret(key: string) {
    return this.secretStorage.get(key);
  }

  public static async deleteSecret(key: string) {
    await this.secretStorage.delete(key);
  }
}
