import * as vscode from "vscode";
import { ChatProvider } from "../providers/chatProvider";
import { BuzzComment } from "./comment";

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

    const rangeString = this._rangeToKey(thread.range);
    mappings.set(rangeString, threadId);
    this._appendCommentToThread(thread, message, res?.message?.u?.username);
  }

  public async replyToMessage(reply: vscode.CommentReply) {
    const thread = reply.thread;
    if (!thread.range) {
      vscode.window.showErrorMessage("Thread range is missing");
      return;
    }

    const rangeString = this._rangeToKey(thread.range);
    const threadId = mappings.get(rangeString);

    if (!threadId) {
      vscode.window.showErrorMessage("No thread ID found for this range");
      return;
    }

    const res = await this.provider.sendMessage(reply.text, threadId);
    this._appendCommentToThread(thread, reply.text, res?.message?.u?.username);
  }

  public async refreshMessage(thread: vscode.CommentThread) {
    if (!thread.range) {
      vscode.window.showErrorMessage("Thread range is missing");
      return;
    }

    const rangeString = this._rangeToKey(thread.range);
    const threadId = mappings.get(rangeString);

    if (!threadId) {
      vscode.window.showErrorMessage("No thread ID found for this range");
      return;
    }
    const parentRes = await this.provider.getParentMessage(threadId);
    const res = await this.provider.getThreadMessages(threadId);

    thread.comments = [];
    if (parentRes?.message) {
      this._appendCommentToThread(
        thread,
        parentRes.message?.msg,
        parentRes.message?.u?.username
      );
    }
    res?.messages?.forEach((message: any) => {
      this._appendCommentToThread(thread, message.msg, message.u?.username);
    });
  }

  private _appendCommentToThread(
    thread: vscode.CommentThread,
    text: string,
    username?: string
  ) {
    const markdownText = new vscode.MarkdownString(text);
    markdownText.isTrusted = true;
    const newComment = new BuzzComment(
      markdownText,
      vscode.CommentMode.Preview,
      {
        name: username ? `@${username}` : "Unknown",
        iconPath: username
          ? vscode.Uri.parse(`https://open.rocket.chat/avatar/${username}`)
          : undefined,
      },
      thread.comments.length ? "canDelete" : undefined,
      thread
    );

    thread.comments = [...thread.comments, newComment];
  }

  private _rangeToKey(range: vscode.Range): string {
    return `${range.start.line}-${range.start.character}-${range.end.line}-${range.end.character}`;
  }
}
