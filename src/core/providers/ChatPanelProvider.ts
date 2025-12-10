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
                    const messageInfo = await messageService.sendMessage(data.text);

                    if (messageInfo) {
                        this._view?.webview.postMessage({
                            command: 'addMessage',
                            message: messageInfo,
                            senderType: 'me'
                        });
                    }
                } catch (error) {
                    console.error('Error handling sendMessage:', error);
                    vscode.window.showErrorMessage('Failed to send message.');
                }
                break;
            }

            case 'getMessages': {
                try {
                    const messageService = Container.get("MessageService");
                    const messages = await messageService.getMessages();

                    this._view?.webview.postMessage({
                        command: 'updateMessages',
                        messages: messages
                    });

                } catch (error) {
                    console.error('Error handling getMessages:', error);
                    vscode.window.showErrorMessage('Failed to get messages.');
                }
                break;
            }
        }
    }
}

