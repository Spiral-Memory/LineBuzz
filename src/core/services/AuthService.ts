
import * as vscode from "vscode";
import { IAuthRepository, AuthSession } from '../../adapters/interfaces/IAuthRepository';

export class AuthService {
    private AuthSession: AuthSession | null = null;
    
    constructor(private authRepo: IAuthRepository) {}

    public async initializeSession(): Promise<AuthSession | null> {
        const githubSession = await vscode.authentication.getSession("github", ["user"], { createIfNone: false });
        
        if (!githubSession) {
            this.setSession(null);
            return null;
        }

        console.log(`[AuthService] GitHub token available for: ${githubSession.account.label}`);

        try {
            const session = await this.authRepo.exchangeTokenForSession(githubSession.accessToken);
            this.setSession(session);
            
            return session;
        } catch (error) {
            console.error("Token exchange failed:", error);
            vscode.window.showErrorMessage("Failed to establish secure session with backend.");
            this.setSession(null);
            return null;
        }
    }


    private setSession(session: AuthSession | null): void {
        this.AuthSession = session;
        vscode.commands.executeCommand('setContext', 'extension.isLoggedIn', !!session);
    }

    public getSession(): AuthSession | null {
        return this.AuthSession;
    }

    public isLoggedIn(): boolean {
        return this.AuthSession !== null;
    }
}