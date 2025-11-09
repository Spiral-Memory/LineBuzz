import * as vscode from "vscode";

export async function activate(context: vscode.ExtensionContext) {
  vscode.window.showInformationMessage("LineBuzz extension activated                !");
}
 
export function deactivate() {}
