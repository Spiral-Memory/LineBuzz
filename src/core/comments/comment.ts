import * as vscode from "vscode";

export class BuzzComment implements vscode.Comment {
  constructor(
    public body: string | vscode.MarkdownString,
    public mode: vscode.CommentMode,
    public author: vscode.CommentAuthorInformation,
    public contextValue?: string
  ) {}
}
