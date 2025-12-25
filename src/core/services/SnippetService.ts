import * as vscode from "vscode";
import * as path from 'path';
import * as fs from 'fs';
import { Snippet } from "../types/ISnippet";
import { logger } from '../utils/logger';
import dedent from 'dedent';

export class SnippetService {
    private _currentSnippets: Snippet[] = [];
    private _onDidCaptureSnippet = new vscode.EventEmitter<Snippet[] | []>();
    public readonly onDidCaptureSnippet = this._onDidCaptureSnippet.event;

    private _dedent(text: string): string {
        if (!text) return '';

        try {
            return dedent(text);
        } catch (error) {
            logger.warn('SnippetService', 'Dedent failed, falling back to raw text', error);
            return text;
        }
    }

    private _isDuplicate(snippet: Snippet): boolean {
        const isDuplicate = this._currentSnippets.some(s =>
            s.filePath === snippet.filePath &&
            s.startLine === snippet.startLine &&
            s.endLine === snippet.endLine
        );
        if (isDuplicate) {
            logger.info('SnippetService', 'Duplicate Snippet', snippet);
        }
        return isDuplicate;
    }

    public async captureFromEditor(editor: vscode.TextEditor): Promise<Snippet | void> {
        if (!editor) return;

        if (editor.document.isUntitled) {
            vscode.window.showWarningMessage('Save your file first to create a Buzz.');
            return;
        }

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
        const uri = editor.document.uri;
        const repo = api.repositories.find((r: any) =>
            uri.fsPath.toLowerCase().startsWith(r.rootUri.fsPath.toLowerCase())
        );
        const remotes = repo?.state?.remotes;

        if (!repo || !remotes?.length) {
            vscode.window.showInformationMessage('LineBuzz works best in shared Git projects.');
            return;
        }

        const realPath = fs.existsSync(uri.fsPath) ? fs.realpathSync.native(uri.fsPath) : uri.fsPath;
        const relativePath = path.relative(repo.rootUri.fsPath, realPath).split(path.sep).join('/');
        const chosenRemote = remotes.find((r: any) => r.name === 'origin') || remotes[0]
        const selection = editor.selection;

        const snippetData: Snippet = {
            filePath: relativePath,
            startLine: selection.start.line + 1,
            endLine: selection.end.line + 1,
            content: this._dedent(editor.document.getText(selection)),
            repoUrl: chosenRemote.fetchUrl
        };

        return snippetData;
    }

    public stageSnippet(snippet: Snippet) {
        if (this._isDuplicate(snippet)) return;
        this._currentSnippets.unshift(snippet);
        this._onDidCaptureSnippet.fire(this._currentSnippets);
        logger.info('SnippetService', 'Snippet staged', snippet);
    }

    public getStagedSnippet(): Snippet[] {
        return this._currentSnippets;
    }

    public removeSnippet(index: number) {
        if (index >= 0 && index < this._currentSnippets.length) {
            const removed = this._currentSnippets.splice(index, 1);
            this._onDidCaptureSnippet.fire(this._currentSnippets);
            logger.info('SnippetService', 'Snippet removed', removed[0]);
        }
    }

    public clearStagedSnippet() {
        this._currentSnippets = [];
        this._onDidCaptureSnippet.fire([]);
    }
}
