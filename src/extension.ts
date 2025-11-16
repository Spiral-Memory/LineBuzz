import * as vscode from "vscode";
import { SupabaseAuthRepository } from './adapters/supabase/SupabaseAuthRepository'; 
import { AuthService } from './core/services/AuthService'; 
import { Container } from './core/services/ServiceContainer';
import { Storage } from "./core/platform/storage";

export async function activate(context: vscode.ExtensionContext) {
    Storage.initialize(context)
    const supbaseAuthRepository = new SupabaseAuthRepository(); 
    const authService = new AuthService(supbaseAuthRepository);
    
    Container.register('AuthService', authService);

    await authService.initializeSession(); 
    
    const disposable = vscode.authentication.onDidChangeSessions(async (e) => {
        if (e.provider.id !== "github") return; 
        await authService.initializeSession();
    });

    context.subscriptions.push(disposable);
}