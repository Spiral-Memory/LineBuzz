import * as vscode from "vscode";

export class WorkspaceStorage {
  private static workspaceStorage: vscode.Memento;

  public static initialize(context: vscode.ExtensionContext) {
    WorkspaceStorage.workspaceStorage = context.workspaceState;
  }

  public static set(key: string, value: any) {
    WorkspaceStorage.workspaceStorage.update(key, value);
  }

  public static get<T>(key: string): T | undefined {
    return WorkspaceStorage.workspaceStorage.get<T>(key);
  }
  public static delete(key: string) {
    WorkspaceStorage.workspaceStorage.update(key, undefined);
  }
}
