import * as vscode from 'vscode';
import { BaseWebviewProvider } from './BaseWebviewProvider';
import { ChatView } from '../../views/ChatView';

export class ChatPanelProvider extends BaseWebviewProvider {
    public static readonly viewId = 'linebuzz.chatpanel';

    constructor(extensionUri: vscode.Uri) {
        super(extensionUri);
    }

    protected _getHtmlForWebview(webview: vscode.Webview): string {
        return ChatView.getHtml(webview, this._getStyles(webview));
    }
}
