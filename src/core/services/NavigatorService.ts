import * as vscode from "vscode";
import * as path from 'path';
import * as fs from 'fs';
import gitUrlParse from 'git-url-parse';
import { Snippet } from "../types/ISnippet";
import { logger } from '../utils/logger';

export class NavigatorService {
    public async openSnippet(snippet: Snippet): Promise<void> {
        if (!snippet) return;

        const gitExtension = vscode.extensions.getExtension('vscode.git');
        if (!gitExtension) {
            logger.error('SnippetService', 'Git extension not found.');
            vscode.window.showErrorMessage('Please enable Git extension in VSCode.');
            return;
        }

        if (!gitExtension.isActive) {
            try {
                logger.info('SnippetService', 'Activating Git extension...');
                await gitExtension.activate();
            }
            catch (e) {
                logger.error('SnippetService', 'Failed to activate Git extension:', e);
                vscode.window.showErrorMessage('Please enable Git extension in VSCode.');
                return;
            }
        }

        const api = gitExtension.exports.getAPI(1);
        const repos = api.repositories;
        if (!repos || repos.length === 0) return;

        let targetIdentity: string | null = null;
        try {
            const snippetInfo = gitUrlParse(snippet.repoUrl);
            targetIdentity = snippetInfo.full_name;
        }
        catch (e) {
            logger.error('NavigatorService', 'Failed to parse repo url:', e);
            return;
        }

        const matchingRepo = repos.find((repo: any) => {
            return repo.state.remotes.some((remote: any) => {
                const url = remote.fetchUrl;
                const remoteInfo = gitUrlParse(url);
                return remoteInfo.full_name.toLowerCase() === targetIdentity.toLowerCase();
            });
        });

        if (matchingRepo) {
            let targetUri: vscode.Uri | undefined;
            const snippetFilePath = snippet.filePath.split('/').join(path.sep);
            const candidate = path.join(matchingRepo.rootUri.fsPath, snippetFilePath);
            if (fs.existsSync(candidate)) {
                targetUri = vscode.Uri.file(candidate);
            }

            if (!targetUri) {
                // TODO: Search all files in repo, this maybe a casing mismatch
                return;
            }

            const editor = await vscode.window.showTextDocument(targetUri);
            const selection = new vscode.Selection(
                new vscode.Position(snippet.startLine - 1, 0),
                new vscode.Position(snippet.endLine - 1, 0)
            );
            editor.selection = selection;
            editor.revealRange(selection);
            logger.info('NavigatorService', 'Navigated to snippet', snippet);
        }
    }
}
