import * as vscode from "vscode";
import { RCComment } from "./comments/RCComments";

export function activate(context: vscode.ExtensionContext) {
  const rcComment = new RCComment();
  
  context.subscriptions.push(rcComment.commentController);

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vsCodeRc.startDiscussion",
      (reply: vscode.CommentReply) => {
        rcComment.startDiscussion(reply);
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vsCodeRc.reply",
      (reply: vscode.CommentReply) => {
        rcComment.replyNote(reply);
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vsCodeRc.refreshMsg",
      (thread: vscode.CommentThread) => {
        rcComment.refreshMsg(thread);
      }
    )
  );
}

export function deactivate() {}
