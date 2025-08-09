import * as vscode from "vscode";
import { VSComment } from "./comments/vsComments";

export function activate(context: vscode.ExtensionContext) {
  const vsComment = new VSComment();
  
  context.subscriptions.push(vsComment.commentController);

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "linebuzz.startDiscussion",
      (reply: vscode.CommentReply) => {
        vsComment.startDiscussion(reply);
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "linebuzz.reply",
      (reply: vscode.CommentReply) => {
        vsComment.replyNote(reply);
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "linebuzz.refreshMsg",
      (thread: vscode.CommentThread) => {
        vsComment.refreshMsg(thread);
      }
    )
  );
}

export function deactivate() {}
