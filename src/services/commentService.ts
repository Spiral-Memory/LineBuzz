import * as vscode from "vscode";
import { BuzzCommentController } from "../core/comments/commentController";
import { RocketChatProvider } from "../infrastructure/providers/rocketChatProvider";

let buzzController: BuzzCommentController | undefined;
let activeEditorListener: vscode.Disposable | undefined;
let commandDisposables: vscode.Disposable[] = [];

export const commentService = {
  async initialize(
    provider: RocketChatProvider,
    context: vscode.ExtensionContext
  ) {

    buzzController = new BuzzCommentController(provider);

    context.subscriptions.push(buzzController.commentController);

    if (vscode.window.activeTextEditor) {
      buzzController.loadCommentsForFile(
        vscode.window.activeTextEditor.document
      );
    }
    activeEditorListener = vscode.window.onDidChangeActiveTextEditor(
      async (editor) => {
        if (editor) {
          await buzzController!.loadCommentsForFile(editor.document);
        }
      }
    );

    commandDisposables = [
      vscode.commands.registerCommand(
        "linebuzz.startDiscussion",
        (msg: vscode.CommentReply) => {
          buzzController!.startDiscussion(msg);
        }
      ),
      vscode.commands.registerCommand(
        "linebuzz.reply",
        (reply: vscode.CommentReply) => {
          buzzController!.replyToMessage(reply);
        }
      ),
      vscode.commands.registerCommand(
        "linebuzz.refreshMessage",
        (thread: vscode.CommentThread) => {
          buzzController!.refreshMessage(thread);
        }
      ),
    ];

    context.subscriptions.push(activeEditorListener, ...commandDisposables);
  },

  async disposeWorkspace() {
    activeEditorListener?.dispose();
    commandDisposables.forEach((d) => d.dispose());
    commandDisposables = [];
    buzzController?.dispose();
    buzzController = undefined;
  },
};
