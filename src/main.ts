import * as vscode from "vscode";
import { storageService } from "./services/storageService";
import { StatusService } from "./services/statusService";
import { ConnectionService } from "./services/connectionService";

export async function activate(context: vscode.ExtensionContext) {
  try {
    storageService.initializeStorage(context);
    const statusBar = new StatusService(context);
    const connectionService = new ConnectionService(statusBar);
    await connectionService.initialize(context);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred during extension activation.";
    vscode.window.showErrorMessage(`LineBuzz failed to activate: ${message}`);
  }
}

export function deactivate() {}
