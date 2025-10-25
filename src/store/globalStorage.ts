import * as vscode from "vscode";

export class GlobalStorage {
  private static globalStorage: vscode.Memento;

  public static initialize(context: vscode.ExtensionContext) {
    GlobalStorage.globalStorage = context.globalState;
  }

  public static set(key: string, value: any) {
    GlobalStorage.globalStorage.update(key, value);
  }

  public static get<T>(key: string): T | undefined {
    return GlobalStorage.globalStorage.get<T>(key);
  }

  public static delete(key: string) {
    GlobalStorage.globalStorage.update(key, undefined);
  }
}
