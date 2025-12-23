import * as vscode from 'vscode';

import { logger } from '../utils/logger';
import { Container } from '../services/ServiceContainer';

export const captureSnippetCommand = async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    try {
        const snippetService = Container.get("SnippetService");
        const snippet = await snippetService.captureFromEditor(editor);

        if (snippet) {
            snippetService.stageSnippet(snippet);
        }
    } catch (error) {
        logger.error('CaptureSnippetCommand', 'Failed to capture snippet:', error);
        vscode.window.showErrorMessage('Failed to capture snippet.');
    }
};