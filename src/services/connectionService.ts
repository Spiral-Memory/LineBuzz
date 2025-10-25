import * as vscode from "vscode";
import { authService } from "./authService";
import { commentService } from "./commentService";
import { AuthSettings } from "../core/auth/authSettings";
import { AuthSecrets } from "../core/auth/authSecrets";
import { WorkspaceStorage } from "../store/workspaceStorage";
import { getOriginRemoteUrl } from "../wrappers/gitUtils";
import { StatusService } from "./statusService";
import { repoContextService } from "./repoContextService";

export class ConnectionService {
  private statusBar: StatusService;
  private currentRepoUrl: string | undefined;
  private commentServiceInitialized = false;

  constructor(statusBar: StatusService) {
    this.statusBar = statusBar;
  }

  public async initialize(context: vscode.ExtensionContext) {
    context.subscriptions.push(
      vscode.commands.registerCommand("linebuzz.showWorkspaceActions", () =>
        this.showWorkspaceActions()
      )
    );
    this.statusBar.showConnecting();
    const provider = await authService.initialize();
    if (!provider) {
      this.statusBar.setDisconnected();
      return;
    }
    this.statusBar.setConnected();

    if (
      vscode.workspace.workspaceFolders &&
      vscode.workspace.workspaceFolders.length > 0
    ) {
      await this.activateWorkspace(provider, context);
    }

    context.subscriptions.push(
      vscode.window.onDidChangeActiveTextEditor(async (editor) => {
        if (!editor) {
          return;
        }
        const repoUrl = getOriginRemoteUrl();
        if (repoUrl && repoUrl !== this.currentRepoUrl) {
          await this.activateWorkspace(provider, context);
        }
      })
    );
  }

  private async showWorkspaceActions() {
    const action = await this.statusBar.promptForAction();
    if (action === "connect") {
      await this.connect();
    } else if (action === "disconnect") {
      await this.disconnect();
    }
  }

  private async connect() {
    this.statusBar.showConnecting();
    try {
      const provider = await authService.initialize(true);
      if (!provider) {
        this.statusBar.showError("Failed to connect workspace.");
        return;
      }
      this.statusBar.setConnected();
    } catch {
      this.statusBar.showError("Failed to connect workspace.");
    }
  }

  private async disconnect() {
    this.statusBar.showDisconnecting();

    AuthSettings.deleteServerUrl();
    AuthSecrets.deleteAuthToken();
    AuthSecrets.deleteUserId();

    const remoteUrl = getOriginRemoteUrl();
    if (remoteUrl) {
      WorkspaceStorage.delete(remoteUrl);
    }

    await commentService.disposeWorkspace();
    this.statusBar.setDisconnected();
    vscode.window.showInformationMessage("Workspace disconnected.");
  }

  private async activateWorkspace(
    provider: any,
    context: vscode.ExtensionContext
  ) {
    const serverUrl = AuthSettings.getServerUrl();
    if (!serverUrl) {
      return;
    }

    const repoUrl = getOriginRemoteUrl();
    if (!repoUrl) {
      return;
    }

    if (repoUrl === this.currentRepoUrl) {
      return;
    }

    try {
      await repoContextService.linkWorkspace(serverUrl);
      this.currentRepoUrl = repoUrl;
      if (!this.commentServiceInitialized) {
        await commentService.initialize(provider, context);
        this.commentServiceInitialized = true;
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to link workspace for LineBuzz.";
      vscode.window.showErrorMessage(message);
    }
  }
}
