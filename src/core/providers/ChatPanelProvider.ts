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

        const authService = Container.get('AuthService');
        const teamService = Container.get('TeamService');
        const snippetService = Container.get('SnippetService');

        const authSub = authService.onDidChangeSession(() => this.updateIdentityState());
        const teamSub = teamService.onDidChangeTeam(() => this.updateIdentityState());
        const snippetSub = snippetService.onDidCaptureSnippet((snippet) => {
            this._view?.webview.postMessage({
                command: 'stageSnippet',
                snippet: snippet
            });
        });

        const stagedSnippet = snippetService.getStagedSnippet();
        if (stagedSnippet) {
            this._view?.webview.postMessage({
                command: 'stageSnippet',
                snippet: stagedSnippet
            });
        }

        webviewView.onDidDispose(() => {
            if (this._subscription) {
                this._subscription.unsubscribe();
                this._subscription = undefined;
            }
            authSub.dispose();
            teamSub.dispose();
            snippetSub.dispose();
        });
    }

    protected async _onDidReceiveMessage(data: any): Promise<void> {
        switch (data.command) {
            case 'getIdentityState':
                await this.updateIdentityState();
                break;
            case 'signIn':
                await vscode.commands.executeCommand('linebuzz.login');
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
                            command: 'appendMessage',
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
                    const { limit, offset } = data;
                    const messages = await messageService.getMessages(limit, offset);

                    this._view?.webview.postMessage({
                        command: offset && offset > 0 ? 'prependMessages' : 'loadInitialMessages',
                        messages: messages
                    });

                    if (this._subscription) {
                        this._subscription.unsubscribe();
                    }

                    const sub = await messageService.subscribeToMessages((message) => {
                        this._view?.webview.postMessage({
                            command: 'appendMessage',
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

    private async updateIdentityState() {
        if (!this._view) { return; }

        const authService = Container.get('AuthService');
        const teamService = Container.get('TeamService');

        const session = await authService.getSession();
        const team = teamService.getTeam();

        this._view.webview.postMessage({
            command: 'updateIdentityState',
            state: {
                isLoggedIn: !!session,
                hasTeam: !!team
            }
        });

        const snippetService = Container.get('SnippetService');
        const stagedSnippet = snippetService.getStagedSnippet();
        if (stagedSnippet) {
            this._view.webview.postMessage({
                command: 'stageSnippet',
                snippet: stagedSnippet
            });
        }
    }
}

