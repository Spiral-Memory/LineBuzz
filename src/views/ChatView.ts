import * as vscode from 'vscode';

export class ChatView {
    public static getHtml(webview: vscode.Webview, styles: string): string {
        return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Chat Panel</title>
        ${styles}
      </head>
      <body>
        <h1>Chat Panel</h1>
        <p>This is where user will chat with other members of the team</p>
      </body>
      </html>`;
    }
}
