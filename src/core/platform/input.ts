import * as vscode from "vscode";

export class Input {
    public static async showInputBox(options: vscode.InputBoxOptions): Promise<string | undefined> {
        return vscode.window.showInputBox(options);
    }
}
