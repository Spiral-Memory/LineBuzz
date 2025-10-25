import * as vscode from "vscode";

export class StatusService {
  private item: vscode.StatusBarItem;
  private currentStatus: "connected" | "disconnected" = "disconnected";

  constructor(context: vscode.ExtensionContext) {
    this.item = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    );
    this.item.command = "linebuzz.showWorkspaceActions";
    this.item.tooltip = "Click to manage workspace connection";
    this.setDisconnected();
    this.item.show();

    context.subscriptions.push(this.item);
  }

  public setConnected() {
    this.item.text = "$(chat-sparkle) Connected $(check)";
    this.currentStatus = "connected";
  }

  public setDisconnected() {
    this.item.text = "$(chat-sparkle) Disconnected $(circle-slash)";
    this.currentStatus = "disconnected";
  }

  public showConnecting() {
    this.item.text = "$(chat-sparkle) Connecting... $(sync~spin)";
  }

  public showDisconnecting() {
    this.item.text = "$(chat-sparkle) Disconnecting... $(sync~spin)";
  }

  public showError(message: string) {
    this.item.text = "$(error) Connection Failed";
    vscode.window.showErrorMessage(message);
  }

  public async promptForAction(): Promise<
    "connect" | "disconnect" | undefined
  > {
    type WorkspaceAction = { label: string; action: "connect" | "disconnect" };

    const options: WorkspaceAction[] =
      this.currentStatus === "disconnected"
        ? [{ label: "Connect Workspace", action: "connect" }]
        : [{ label: "Disconnect Workspace", action: "disconnect" }];

    const selection = await vscode.window.showQuickPick(options, {
      placeHolder: "Select an action",
    });

    return selection?.action;
  }
}
