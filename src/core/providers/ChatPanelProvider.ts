import * as vscode from 'vscode';
import { BaseWebviewProvider } from './BaseWebviewProvider';

export class ChatPanelProvider extends BaseWebviewProvider {
    public static readonly viewId = 'linebuzz.chatpanel';

    constructor(extensionUri: vscode.Uri) {
        super(extensionUri);
    }
}

