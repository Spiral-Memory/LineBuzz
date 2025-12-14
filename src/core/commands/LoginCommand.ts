import * as vscode from "vscode";

export async function loginCommand() {
    await vscode.authentication.getSession("github", ["user"], { createIfNone: true });
}
