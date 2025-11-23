import * as vscode from "vscode";
import { SupabaseAuthRepository } from './adapters/supabase/SupabaseAuthRepository';
import { AuthService } from './core/services/AuthService';
import { Container } from './core/services/ServiceContainer';
import { Storage } from "./core/platform/storage";
import { logger } from './core/utils/logger';
import { SupabaseTeamRepository } from "./adapters/supabase/SupabaseTeamRepository";
import { TeamService } from "./core/services/TeamService";
import { createTeamCommand } from "./core/commands/CreateTeamCommand";
import { joinTeamCommand } from "./core/commands/JoinTeamCommand";
import { leaveTeamCommand } from "./core/commands/LeaveTeamCommand";

export async function activate(context: vscode.ExtensionContext) {
    let authService: AuthService | undefined;
    let debounceTimer: NodeJS.Timeout;
    Storage.initialize(context);
    try {
        const supbaseAuthRepository = new SupabaseAuthRepository();
        authService = new AuthService(supbaseAuthRepository);
        Container.register('AuthService', authService);
        await authService.initializeSession();

        const supabaseTeamRepository = new SupabaseTeamRepository();
        const teamService = new TeamService(supabaseTeamRepository);
        Container.register('TeamService', teamService);
        await teamService.initialize();

        context.subscriptions.push(
            vscode.commands.registerCommand('linebuzz.createTeam', createTeamCommand),
            vscode.commands.registerCommand('linebuzz.joinTeam', joinTeamCommand),
            vscode.commands.registerCommand('linebuzz.leaveTeam', leaveTeamCommand)
        );

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