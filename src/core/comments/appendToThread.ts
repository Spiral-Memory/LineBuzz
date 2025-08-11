import * as vscode from "vscode";
import { BuzzComment } from "./comment";

export function appendCommentToThread(
  thread: vscode.CommentThread,
  text: string,
  username?: string
) {
  const markdownText = new vscode.MarkdownString(text);
  markdownText.isTrusted = true;
  const newComment = new BuzzComment(
    markdownText,
    vscode.CommentMode.Preview,
    {
      name: username ? `@${username}` : "Unknown",
      iconPath: username
        ? vscode.Uri.parse(`https://open.rocket.chat/avatar/${username}`)
        : undefined,
    },
    thread.comments.length ? "canDelete" : undefined
  );

  thread.comments = [...thread.comments, newComment];
}
