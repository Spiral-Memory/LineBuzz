import * as vscode from 'vscode';
import { randomUUID } from 'crypto';

export class BuzzComment implements vscode.Comment {
  id: string;
  savedBody: string | vscode.MarkdownString;

  constructor(
    public body: string | vscode.MarkdownString,
    public mode: vscode.CommentMode,
    public author: vscode.CommentAuthorInformation,
    public contextValue?: string,
	public parent?: vscode.CommentThread, // Optional parent thread
  ) {
    this.id = randomUUID();
    this.savedBody = body;
  }
}
