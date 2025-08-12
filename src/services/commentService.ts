import * as vscode from "vscode";
import { BuzzCommentController } from "../core/comments/commentController";
import { RocketChatProvider } from "../infrastructure/providers/rocketChatProvider";

export const commentService = {
  async initialize(
    provider: RocketChatProvider,
    context: vscode.ExtensionContext
  ) {
    const buzzController = new BuzzCommentController(provider);

    context.subscriptions.push(buzzController.commentController);

    if (vscode.window.activeTextEditor) {
      buzzController.loadCommentsForFile(
        vscode.window.activeTextEditor.document
      );
    }

    vscode.window.onDidChangeActiveTextEditor(async (editor) => {
      if (editor) {
        await buzzController.loadCommentsForFile(editor.document);
      }
    });

    context.subscriptions.push(
      vscode.commands.registerCommand(
        "linebuzz.startDiscussion",
        (msg: vscode.CommentReply) => {
          buzzController.startDiscussion(msg);
        }
      ),
      vscode.commands.registerCommand(
        "linebuzz.reply",
        (reply: vscode.CommentReply) => {
          buzzController.replyToMessage(reply);
        }
      ),
      vscode.commands.registerCommand(
        "linebuzz.refreshMessage",
        (thread: vscode.CommentThread) => {
          buzzController.refreshMessage(thread);
        }
      )
    );
  },
};
