import * as vscode from "vscode";
import { SupabaseAuthRepository } from './adapters/supabase/SupabaseAuthRepository';
import { AuthService } from './core/services/AuthService';
import { Container } from './core/services/ServiceContainer';
import { Storage } from "./core/platform/storage";
import { logger } from './core/utils/logger';
import { SupabaseTeamRepository } from "./adapters/supabase/SupabaseTeamRepository";
import { TeamService } from "./core/services/TeamService";
import { MessageService } from "./core/services/MessageService";
import { SupabaseMessageRepository } from "./adapters/supabase/SupabaseMessageRepository";
import { loginCommand } from "./core/commands/LoginCommand";
import { createTeamCommand } from "./core/commands/CreateTeamCommand";
import { sendMessageCommand } from "./core/commands/SendMessageCommand";
import { joinTeamCommand } from "./core/commands/JoinTeamCommand";
import { leaveTeamCommand } from "./core/commands/LeaveTeamCommand";
import { captureSnippetCommand } from "./core/commands/CaptureSnippetCommand";
import { TeamFeedProvider } from "./core/providers/TeamFeedProvider";
import { ChatPanelProvider } from "./core/providers/ChatPanelProvider";
import { SnippetService } from "./core/services/SnippetService";


export async function activate(context: vscode.ExtensionContext) {
    let authService: AuthService | undefined;
    let debounceTimer: NodeJS.Timeout;
    Storage.initialize(context);
    try {
        const supabaseTeamRepository = new SupabaseTeamRepository();
        const teamService = new TeamService(supabaseTeamRepository);
        Container.register('TeamService', teamService);
        await teamService.initialize();

        const supbaseAuthRepository = new SupabaseAuthRepository();
        authService = new AuthService(supbaseAuthRepository);
        Container.register('AuthService', authService);
        await authService.initializeSession(false);

        const supabaseMessageRepository = new SupabaseMessageRepository();
        const messageService = new MessageService(supabaseMessageRepository);
        Container.register('MessageService', messageService);

        const snippetService = new SnippetService();
        Container.register('SnippetService', snippetService);

        const teamFeedPanelProvider = new TeamFeedProvider();
        vscode.window.registerTreeDataProvider(TeamFeedProvider.viewId, teamFeedPanelProvider);

        const chatPanelProvider = new ChatPanelProvider(context.extensionUri);
        context.subscriptions.push(
            vscode.window.registerWebviewViewProvider(ChatPanelProvider.viewId, chatPanelProvider)
        );

        context.subscriptions.push(
            vscode.commands.registerCommand('linebuzz.login', loginCommand),
            vscode.commands.registerCommand('linebuzz.createTeam', createTeamCommand),
            vscode.commands.registerCommand('linebuzz.joinTeam', joinTeamCommand),
            vscode.commands.registerCommand('linebuzz.leaveTeam', leaveTeamCommand),
            vscode.commands.registerCommand('linebuzz.sendMessage', sendMessageCommand),
            vscode.commands.registerCommand('linebuzz.captureSnippet', captureSnippetCommand)
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