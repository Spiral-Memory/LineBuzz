import * as vscode from "vscode";
import { SupabaseAuthRepository } from './adapters/supabase/SupabaseAuthRepository';
import { AuthService } from './core/services/AuthService';
import { Container } from './core/services/ServiceContainer';
import { Storage } from "./core/platform/storage";
import { logger } from './core/utils/logger';

export async function activate(context: vscode.ExtensionContext) {
    let authService: AuthService | undefined;
    let debounceTimer: NodeJS.Timeout;
    Storage.initialize(context);
    try {
        const supbaseAuthRepository = new SupabaseAuthRepository();
        authService = new AuthService(supbaseAuthRepository);
        Container.register('AuthService', authService);
        await authService.initializeSession();

    } catch (e) {
        logger.error("Extension", "Failed to activate extension:", e);
        return;
    }

    const disposable = vscode.authentication.onDidChangeSessions((e) => {
        if (e.provider.id !== "github") return;
        if (authService) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(async () => {
                await authService.initializeSession();
            }, 500);
        } else {
            logger.error("Extension", "AuthService not initialized when onDidChangeSessions fired.");
        }
    });

    context.subscriptions.push(disposable);
}