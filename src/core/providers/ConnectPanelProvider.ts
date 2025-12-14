import * as vscode from 'vscode';
import { BaseWebviewProvider } from './BaseWebviewProvider';
import { Container } from '../services/ServiceContainer';

export class ConnectPanelProvider extends BaseWebviewProvider {
    public static readonly viewId = 'linebuzz.connect';

    private _authSubscription: vscode.Disposable | undefined;
    private _teamSubscription: vscode.Disposable | undefined;

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

        this._authSubscription = authService.onDidChangeSession(() => this.updateWebviewState());
        this._teamSubscription = teamService.onDidChangeTeam(() => this.updateWebviewState());

        webviewView.onDidDispose(() => {
            this._authSubscription?.dispose();
            this._teamSubscription?.dispose();
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
