import * as vscode from "vscode";

export async function askInput(
  prompt: string,
  options?: { password?: boolean }
): Promise<string | undefined> {
  const input = await vscode.window.showInputBox({
    prompt,
    password: options?.password ?? false,
    ignoreFocusOut: true,
  });
  return input;
}
