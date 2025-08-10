import * as vscode from "vscode";
import { BuzzCommentController } from "./comments/commentController";
import { RocketChatProvider } from "./providers/rocketChatProvider";
import { AuthData } from "./auth/authData";
import { askInput } from "./utils/askInput";

const WORKSPACE_URL_KEY = "linebuzz.workspaceUrl";

export async function activate(context: vscode.ExtensionContext) {
  AuthData.initialize(context);

  const getWorkspaceUrl = async (): Promise<string | undefined> => {
    let savedUrl = context.globalState.get<string>(WORKSPACE_URL_KEY);
    if (savedUrl) {
      return savedUrl;
    }
    const url = await askInput("Your workspace URL");
    if (url) {
      await context.globalState.update(WORKSPACE_URL_KEY, url);
    }
    return url;
  };

  const workspaceUrl = await getWorkspaceUrl();
  if (!workspaceUrl) {
    vscode.window.showErrorMessage("Workspace URL is required.");
    return;
  }

  const provider = new RocketChatProvider(workspaceUrl);

  try {
    const authToken = await AuthData.getAuthToken();
    const userId = await AuthData.getUserId();

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
      vscode.commands.registerCommand("linebuzz.refreshMessage", (thread: vscode.CommentThread) => {
        buzzController.refreshMessage(thread);
      })
    );
  } catch (error) {
    vscode.window.showErrorMessage("Login failed. Extension features will be disabled.");
    console.error("Login error:", error);
  }
}

export function deactivate() {}
