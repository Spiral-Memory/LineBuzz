
import * as vscode from "vscode";
import { IAuthRepository, AuthSession } from '../../adapters/interfaces/IAuthRepository';
import { logger } from "../utils/logger";

export class AuthService {

    constructor(private authRepo: IAuthRepository) { }

    public async initializeSession(): Promise<AuthSession | null> {
        const githubSession = await vscode.authentication.getSession("github", ["user"], { createIfNone: false });
        logger.info("AuthService", "GitHub session:", githubSession)

        if (!githubSession) {
            logger.info("AuthService", "No GitHub session found.");
            await this.authRepo.signOut();
            vscode.commands.executeCommand('setContext', 'extension.isLoggedIn', false);
            return null;
        }

        logger.info("AuthService", `GitHub token available for: ${githubSession.account.label}`);

        try {
            const session = await this.authRepo.exchangeTokenForSession(githubSession.accessToken);
            logger.info("AuthService", "Secure session established with backend.");
            vscode.window.showInformationMessage(`Logged in as ${session.username}`);
            vscode.commands.executeCommand('setContext', 'extension.isLoggedIn', true);

            return session;
        } catch (error) {
            logger.error("AuthService", "Token exchange failed:", error);
            vscode.window.showErrorMessage("Failed to log in. Please try again.");
            vscode.commands.executeCommand('setContext', 'extension.isLoggedIn', false);
            return null;
        }
    }
}

