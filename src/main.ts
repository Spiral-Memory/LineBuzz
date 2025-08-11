import * as vscode from "vscode";
import { storageService } from "./core/services/initializeStorage";
import { commentService } from "./core/services/commentService";
import { authService } from "./core/services/authService";

export async function activate(context: vscode.ExtensionContext) {
  try {
    storageService.initializeStorage(context);

    const provider = await authService.create();
    await commentService.initialize(provider, context);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred during extension activation.";

    vscode.window.showErrorMessage(`LineBuzz failed to activate: ${message}`);

    console.error("Extension activation error:", error);
  }
}

export function deactivate() {}
