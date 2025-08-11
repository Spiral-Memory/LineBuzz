import * as vscode from "vscode";
import * as path from "path";
import { supabase } from "../../infrastructure/api/supabaseClient";
import { ChatProvider } from "../../infrastructure/providers/chatProvider";
import { rangeToKey } from "../../wrappers/rangeToKey";
import { appendCommentToThread } from "./appendToThread";
import { WorkspaceStorage } from "../../store/workspaceStorage";
import { getCurrentCommitHash, getRepoRelativePath } from "../../wrappers/gitUtils";
import { parseRangeString } from "../../wrappers/rangeUtils";
import { getOriginRemoteUrl } from "../../wrappers/gitUtils";
export class BuzzCommentController {
  public commentController: vscode.CommentController;
  private mappings = new Map<string, string>();
  private loadedThreads = new Set<string>();

  constructor(private provider: ChatProvider) {
    this.commentController = vscode.comments.createCommentController(
      "buzz-comments",
      "LineBuzz Comments"
    );

    this.commentController.commentingRangeProvider = {
      provideCommentingRanges: (document: vscode.TextDocument) => {
        const lineCount = document.lineCount;
        return [new vscode.Range(0, 0, lineCount - 1, 0)];
      },
    };
  }

  public async loadCommentsForFile(document: vscode.TextDocument) {
    const contextUuid = this._getContextUuid();
    if (!contextUuid) {
      vscode.window.showErrorMessage(
        "No workspace context UUID found for this repository"
      );
      return;
    }

    const filename = getRepoRelativePath(document.uri.fsPath);
    const { data: comments, error } = await supabase
      .from("comments")
      .select("*")
      .eq("context_uuid", contextUuid)
      .eq("filename", filename);

    if (error) {
      console.error("Failed to fetch comments for file", error);
      return;
    }

    for (const comment of comments) {
      if (this.loadedThreads.has(comment.thread_id)) {
        continue;
      }
      const range = parseRangeString(comment.range_string, document);
      if (!range) {
        continue;
      }

      this.commentController.createCommentThread(document.uri, range, [
        {
          body: "Buzz not loaded yet -- refresh to hear the chatter",
          mode: vscode.CommentMode.Preview,
          author: {
            name: "LineBuzz",
            iconPath: vscode.Uri.parse(
              `https://open.rocket.chat/avatar/linebuzz`
            ),
          },
        },
      ]);

      this.mappings.set(comment.range_string, comment.thread_id);
      this.loadedThreads.add(comment.thread_id);
    }
  }

  public async startDiscussion(initialMessage: vscode.CommentReply) {
    const thread = initialMessage.thread;
    if (!thread.range) {
      vscode.window.showErrorMessage("Thread range is missing");
      return;
    }

    const document = vscode.workspace.textDocuments.find(
      (d) => d.uri.toString() === thread.uri.toString()
    );

    if (!document) {
      vscode.window.showErrorMessage("Document not found for thread");
      return;
    }

    const snippetText = document.getText(thread.range);
    const snippet = snippetText
      ? "```\n" + snippetText.replace(/`/g, "\\`") + "\n```"
      : "";

    const message = initialMessage.text + "\n" + snippet;
    const res = await this.provider.sendMessage(message);
    const threadId = res?.message?._id;

    if (!threadId) {
      vscode.window.showErrorMessage("Failed to start discussion thread");
      return;
    }

    const rangeString = rangeToKey(thread.range);
    const contextUuid = this._getContextUuid();

    if (!contextUuid) {
      vscode.window.showErrorMessage(
        "No workspace context UUID found for this repository"
      );
      return;
    }

    const commitHash = getCurrentCommitHash();
    if (!contextUuid) {
      vscode.window.showErrorMessage(
        "Context ID not found. Cannot save comment."
      );
      return;
    }

    const filename = getRepoRelativePath(document.uri.fsPath);

    const { error } = await supabase.from("comments").insert([
      {
        filename,
        range_string: rangeString,
        thread_id: threadId,
        context_uuid: contextUuid,
        commit_hash: commitHash,
      },
    ]);

    if (error) {
      console.error("Failed to save comment mapping:", error);
      vscode.window.showErrorMessage("Failed to save comment metadata");
    }

    appendCommentToThread(thread, message, res?.message?.u?.username);
  }

  public async replyToMessage(reply: vscode.CommentReply) {
    const thread = reply.thread;
    if (!thread.range) {
      vscode.window.showErrorMessage("Thread range is missing");
      return;
    }

    const rangeString = rangeToKey(thread.range);
    const threadId = this.mappings.get(rangeString);

    if (!threadId) {
      vscode.window.showErrorMessage("No thread ID found for this range");
      return;
    }

    const res = await this.provider.sendMessage(reply.text, threadId);
    appendCommentToThread(thread, reply.text, res?.message?.u?.username);
  }

  public async refreshMessage(thread: vscode.CommentThread) {
    if (!thread.range) {
      vscode.window.showErrorMessage("Thread range is missing");
      return;
    }

    const rangeString = rangeToKey(thread.range);
    const threadId = this.mappings.get(rangeString);

    if (!threadId) {
      vscode.window.showErrorMessage("No thread ID found for this range");
      return;
    }
    const parentRes = await this.provider.getMessageById(threadId);
    const res = await this.provider.getThreadMessages(threadId);

    thread.comments = [];
    if (parentRes?.message) {
      appendCommentToThread(
        thread,
        parentRes.message?.msg,
        parentRes.message?.u?.username
      );
    }
    res?.messages?.forEach((message: any) => {
      appendCommentToThread(thread, message.msg, message.u?.username);
    });
  }

  private _getContextUuid(): string | null {
    const remoteUrl = getOriginRemoteUrl();
    if (!remoteUrl) {
      vscode.window.showErrorMessage(
        "Origin remote URL not found or Git extension not available"
      );
      return null;
    }
    const contextUuid = WorkspaceStorage.get<string>(remoteUrl);
    if (!contextUuid) {
      vscode.window.showErrorMessage(
        "No workspace context UUID found for this repository"
      );
      return null;
    }
    return contextUuid;
  }
}
