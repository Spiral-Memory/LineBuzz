import * as vscode from 'vscode';

export abstract class BaseWebviewProvider implements vscode.WebviewViewProvider {
    protected _view?: vscode.WebviewView;

    constructor(
        protected readonly _extensionUri: vscode.Uri
    ) { }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                this._extensionUri
            ]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
    }

    protected abstract _getHtmlForWebview(webview: vscode.Webview): string;

    protected _getStyles(webview: vscode.Webview): string {
        return `
            <style>
                body {
                    padding: 10px;
                    font-family: var(--vscode-font-family);
                    color: var(--vscode-foreground);
                    background-color: var(--vscode-editor-background);
                }
            </style>
        `;
    }
}
