
import * as vscode from "vscode";
import { Container } from "./ServiceContainer";
import { IAuthRepository, AuthSession } from '../../adapters/interfaces/IAuthRepository';
import { logger } from "../utils/logger";
export class AuthService {

    private _onDidChangeSession = new vscode.EventEmitter<AuthSession | null>();
    public readonly onDidChangeSession = this._onDidChangeSession.event;

    constructor(private authRepo: IAuthRepository) { }

    public async getSession(): Promise<AuthSession | null> {
        try {
            return await this.authRepo.getSession();
        } catch (error) {
            logger.error("AuthService", "Failed to retrieve session:", error);
            return null;
        }
    }

    public async initializeSession(): Promise<AuthSession | null> {
        const githubSession = await vscode.authentication.getSession("github", ["user"], { createIfNone: false });

        if (!githubSession) {
            await this.authRepo.signOut();
            const teamService = Container.get("TeamService");
            teamService.leaveTeam(false);
            vscode.commands.executeCommand('setContext', 'extension.isLoggedIn', false);
            vscode.commands.executeCommand('setContext', 'extension.isLoggedIn', false);
            this._onDidChangeSession.fire(null);
            return null;
        }

        logger.info("AuthService", `GitHub token available for: ${githubSession.account.label}`);

        try {
            const session = await this.authRepo.exchangeTokenForSession(githubSession.accessToken);
            logger.info("AuthService", "Secure session established with backend.");
            vscode.window.showInformationMessage(`Logged in as ${session.username}`);
            vscode.commands.executeCommand('setContext', 'extension.isLoggedIn', true);
            this._onDidChangeSession.fire(session);
            return session;

        } catch (error) {
            logger.error("AuthService", "Token exchange failed:", error);
            vscode.window.showErrorMessage("Failed to log in. Please try again.");
            vscode.commands.executeCommand('setContext', 'extension.isLoggedIn', false);
            this._onDidChangeSession.fire(null);
            return null;
        }
    }
}

