import * as vscode from "vscode";
import { BuzzCommentController } from "./core/comments/commentController";
import { RocketChatProvider } from "./infrastructure/providers/rocketChatProvider";
import { AuthSecrets } from "./core/auth/authSecrets";
import { askInput } from "./wrappers/askInput";
import { AuthSettings } from "./core/auth/authSettings";
import { WorkspaceStorage } from "./store/workspaceStorage";
import { cacheRepoContext } from "./core/services/cacheRepoContext";
import { GlobalStorage } from "./store/globalStorage";
import { SecretStorage } from "./store/secretStorage";

export async function activate(context: vscode.ExtensionContext) {
  GlobalStorage.initialize(context);
  SecretStorage.initialize(context);
  WorkspaceStorage.initialize(context);

  try {
    let serverUrl = AuthSettings.getServerUrl();
    if (!serverUrl) {
      serverUrl = await askInput("Your Server URL");
      if (!serverUrl) {
        vscode.window.showErrorMessage("Server URL is required.");
        return;
      }
      AuthSettings.setServerUrl(serverUrl);
    }

    const provider = new RocketChatProvider(serverUrl);

    const authToken = await AuthSecrets.getAuthToken();
    const userId = await AuthSecrets.getUserId();
    if (authToken && userId) {
      await provider.login({ user: "", resume: authToken });
    } else {
      const email = await askInput("Your email");
      if (!email) {
        vscode.window.showErrorMessage("Email is required.");
        return;
      }

      const password = await askInput("Your password", { password: true });
      if (!password) {
        vscode.window.showErrorMessage("Password is required.");
        return;
      }
      await provider.login({ user: email, password });
    }

    await cacheRepoContext(serverUrl);

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
        (initialMessage: vscode.CommentReply) => {
          buzzController.startDiscussion(initialMessage);
        }
      )
    );

    context.subscriptions.push(
      vscode.commands.registerCommand(
        "linebuzz.reply",
        (reply: vscode.CommentReply) => {
          buzzController.replyToMessage(reply);
        }
      )
    );

    context.subscriptions.push(
      vscode.commands.registerCommand(
        "linebuzz.refreshMessage",
        (thread: vscode.CommentThread) => {
          buzzController.refreshMessage(thread);
        }
      )
    );
  } catch (error) {
    vscode.window.showErrorMessage(
      "Login failed. Extension features will be disabled."
    );
    console.error("Login error:", error);
  }
}

export function deactivate() {}
