import * as vscode from "vscode";
import { WorkspaceStorage } from "../../store/workspaceStorage";
import { GlobalStorage } from "../../store/globalStorage";
import { SecretStorage } from "../../store/secretStorage";

export const storageService = {
  initializeStorage(context: vscode.ExtensionContext) {
    GlobalStorage.initialize(context);
    SecretStorage.initialize(context);
    WorkspaceStorage.initialize(context);
  },
};
