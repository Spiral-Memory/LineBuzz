import * as vscode from 'vscode';
import { BaseWebviewProvider } from './BaseWebviewProvider';

import { Container } from '../services/ServiceContainer';

export class ChatPanelProvider extends BaseWebviewProvider {
    public static readonly viewId = 'linebuzz.chatpanel';

    constructor(extensionUri: vscode.Uri) {
        super(extensionUri);
    }

    protected async _onDidReceiveMessage(data: any): Promise<void> {
        switch (data.command) {
            case 'sendMessage': {
                try {
                    const messageService = Container.get("MessageService");
                    await messageService.sendMessage(data.text);
                } catch (error) {
                    console.error('Error handling sendMessage:', error);
                    vscode.window.showErrorMessage('Failed to process message.');
                }
                break;
            }
        }
    }
}

