import * as vscode from "vscode";
import { BuzzCommentController } from "./comments/commentController";
import { RocketChatProvider } from "./providers/rocketChatProvider";

export async function activate(context: vscode.ExtensionContext) {
  const provider = new RocketChatProvider("http://localhost:3000");

  await provider.login({
    user: "zishan.barun@gmail.com",
    password: "spiral_memory"
  });

  const buzzController = new BuzzCommentController(provider);

  context.subscriptions.push(buzzController.commentController);

  context.subscriptions.push(
    vscode.commands.registerCommand("linebuzz.startDiscussion", (initialMessage: vscode.CommentReply) => {
      buzzController.startDiscussion(initialMessage);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("linebuzz.reply", (reply: vscode.CommentReply) => {
      buzzController.replyToMessage(reply);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("linebuzz.refreshMsg", (thread: vscode.CommentThread) => {
      buzzController.refreshMessage(thread);
    })
  );
}

export function deactivate() {}
