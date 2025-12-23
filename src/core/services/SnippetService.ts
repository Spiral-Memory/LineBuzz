import * as vscode from "vscode";
import * as path from 'path';
import * as fs from 'fs';
import { Snippet } from "../types/ISnippet";
import { logger } from '../utils/logger';

export class SnippetService {
    private _currentSnippet: Snippet | null = null;
    private _onDidCaptureSnippet = new vscode.EventEmitter<Snippet | null>();
    public readonly onDidCaptureSnippet = this._onDidCaptureSnippet.event;

    public async captureFromEditor(editor: vscode.TextEditor): Promise<Snippet | void> {
        if (!editor) return;

        if (editor.document.isUntitled) {
            vscode.window.showWarningMessage('Save your file first to create a Buzz.');
            return;
        }

        const uri = editor.document.uri;
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
        const repo = api.repositories.find((r: any) =>
            uri.fsPath.toLowerCase().startsWith(r.rootUri.fsPath.toLowerCase())
        );
        const remotes = repo?.state?.remotes;

        if (!repo || !remotes?.length) {
            vscode.window.showInformationMessage('LineBuzz works best in shared Git projects.');
            return;
        }

        const chosenRemote = remotes.find((r: any) => r.name === 'origin') || remotes[0]
        const realPath = fs.existsSync(uri.fsPath) ? fs.realpathSync.native(uri.fsPath) : uri.fsPath;
        const relativePath = path.relative(repo.rootUri.fsPath, realPath).split(path.sep).join('/');
        const selection = editor.selection;

        const snippetData: Snippet = {
            filePath: relativePath,
            startLine: selection.start.line + 1,
            endLine: selection.end.line + 1,
            content: editor.document.getText(selection),
            repoUrl: chosenRemote.fetchUrl
        };

        return snippetData;
    }

    public stageSnippet(snippet: Snippet) {
        this._currentSnippet = snippet;
        this._onDidCaptureSnippet.fire(snippet);
        logger.info('SnippetService', 'Snippet staged', snippet);
    }

    public getStagedSnippet(): Snippet | null {
        return this._currentSnippet;
    }

    public clearStagedSnippet() {
        this._currentSnippet = null;
        this._onDidCaptureSnippet.fire(null);
    }
}
