import * as vscode from 'vscode';
import { BaseWebviewProvider } from './BaseWebviewProvider';

import { Container } from '../services/ServiceContainer';

export class ChatPanelProvider extends BaseWebviewProvider {
    public static readonly viewId = 'linebuzz.chatpanel';

    private _subscription: { unsubscribe: () => void } | undefined;

    constructor(extensionUri: vscode.Uri) {
        super(extensionUri);
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        super.resolveWebviewView(webviewView, context, _token);

        webviewView.onDidDispose(() => {
            if (this._subscription) {
                this._subscription.unsubscribe();
                this._subscription = undefined;
            }
        });
    }

    protected async _onDidReceiveMessage(data: any): Promise<void> {
        switch (data.command) {
            case 'getState':
                await this.updateWebviewState();
                break;
            case 'signIn':
                await vscode.commands.executeCommand('linebuzz.login');
                const authService = Container.get('AuthService');
                await authService.initializeSession();
                break;
            case 'createTeam':
                await vscode.commands.executeCommand('linebuzz.createTeam');
                break;
            case 'joinTeam':
                await vscode.commands.executeCommand('linebuzz.joinTeam');
                break;
            case 'sendMessage': {
                try {
                    const messageService = Container.get("MessageService");
                    const messageInfo = await messageService.sendMessage(data.text);
                    if (messageInfo) {
                        this._view?.webview.postMessage({
                            command: 'addMessage',
                            message: messageInfo,
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

                    if (this._subscription) {
                        this._subscription.unsubscribe();
                    }

                    const sub = await messageService.subscribeToMessages((message) => {
                        this._view?.webview.postMessage({
                            command: 'addMessage',
                            message: message,
                        });
                    });

                    if (sub) {
                        this._subscription = sub;
                    }

                } catch (error) {
                    console.error('Error handling getMessages:', error);
                    vscode.window.showErrorMessage('Failed to get messages.');
                }
                break;
            }
        }
    }

    private async updateWebviewState() {
        if (!this._view) { return; }

        const authService = Container.get('AuthService');
        const teamService = Container.get('TeamService');

        const session = await authService.getSession();
        const team = teamService.getTeam();

        this._view.webview.postMessage({
            command: 'updateState',
            state: {
                isLoggedIn: !!session,
                hasTeam: !!team
            }
        });
    }
}

