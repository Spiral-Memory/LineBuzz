import * as vscode from "vscode";
import { BuzzCommentController } from "./comments/commentController";
import { RocketChatProvider } from "./providers/rocketChatProvider";
import { AuthData } from "./auth/authData";
import { askInput } from "./utils/askInput";
import { getOriginRemoteUrl } from "./utils/gitUtils";
import { supabase } from "./api/supabaseClient";
import { setContextId } from "./store/contextStore";

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

    const remoteUrl = getOriginRemoteUrl();
    if (!remoteUrl) {
      vscode.window.showErrorMessage(
        "Origin remote URL not found or Git extension not available"
      );
      return;
    }

    const { error: upsertError } = await supabase.from("contexts").upsert(
      [
        {
          repo: remoteUrl,
          platform: "rocketchat",
          server: workspaceUrl,
          channel: "general",
        },
      ],
      { onConflict: "repo,platform,server,channel", ignoreDuplicates: true }
    );

    if (upsertError) {
      console.error("Failed to save context:", upsertError);
      vscode.window.showErrorMessage("Failed to save workspace context");
      return;
    }

    const { data, error: fetchError } = await supabase
      .from("contexts")
      .select("uuid")
      .eq("repo", remoteUrl)
      .eq("platform", "rocketchat")
      .eq("server", workspaceUrl)
      .eq("channel", "general")
      .single();

    if (fetchError) {
      console.error("Failed to fetch context UUID:", fetchError);
      vscode.window.showErrorMessage("Failed to fetch workspace context UUID");
      return;
    }

    setContextId(data.uuid);

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
