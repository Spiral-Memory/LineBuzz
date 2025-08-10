import * as vscode from "vscode";
import { supabase } from "../api/supabaseClient";
import { ChatProvider } from "../providers/chatProvider";
import { rangeToKey } from "../utils/rangeToKey";
import { appendCommentToThread } from "./appendToThread";
import { getContextId } from "../store/contextStore";
import { getCurrentCommitHash } from "../utils/gitRemote";

let mappings = new Map<string, string>();

export class BuzzCommentController {
  public commentController: vscode.CommentController;

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

  public async startDiscussion(initialMessage: vscode.CommentReply) {
    const thread = initialMessage.thread;
    if (!thread.range) {
      vscode.window.showErrorMessage("Thread range is missing");
      return;
    }

    const doc = vscode.workspace.textDocuments.find(
      (d) => d.uri.toString() === thread.uri.toString()
    );

    if (!doc) {
      vscode.window.showErrorMessage("Document not found for thread");
      return;
    }

    const snippetText = doc.getText(thread.range);
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
    const contextId = getContextId();
    const commitHash = getCurrentCommitHash();
    if (!contextId) {
      vscode.window.showErrorMessage(
        "Context ID not found. Cannot save comment."
      );
      return;
    }

    const filename = doc.uri.path.split("/").pop() || "unknown";

    const { error } = await supabase.from("comments").insert([
      {
        filename,
        range_string: rangeString,
        thread_id: threadId,
        context_uuid: contextId,
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
    const threadId = mappings.get(rangeString);

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
    const threadId = mappings.get(rangeString);

    if (!threadId) {
      vscode.window.showErrorMessage("No thread ID found for this range");
      return;
    }
    const parentRes = await this.provider.getParentMessage(threadId);
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
}
