import * as vscode from "vscode";
import { ChatProvider } from "../providers/chatProvider";
import { BuzzComment } from "./comment";

let selectedText: string | undefined;
let mappings = new Map<string, string>();

export class BuzzCommentController {
  public commentController: vscode.CommentController;

  constructor(private provider: ChatProvider) {
    this.commentController = vscode.comments.createCommentController(
      "buzz-comments",
      "LineBuzz Comments"
    );

    vscode.window.onDidChangeTextEditorSelection(() => {
      const newSelectedText = this._getSelectedText();
      if (newSelectedText.length > (selectedText?.length || 0)) {
        selectedText = newSelectedText;
      }
    });

    this.commentController.commentingRangeProvider = {
      provideCommentingRanges: (document: vscode.TextDocument) => {
        const lineCount = document.lineCount;
        return [new vscode.Range(0, 0, lineCount - 1, 0)];
      },
    };
  }

  public async startDiscussion(reply: vscode.CommentReply) {
    const thread = reply.thread;
    if (!thread.range) {
      vscode.window.showErrorMessage("Thread range is missing");
      return;
    }

    const snippet = selectedText
      ? "```\n" + selectedText.replace(/`/g, "\\`") + "\n```"
      : "No code selected";

    const sentResponse = await this.provider.sendMessage(snippet);
    const threadId = sentResponse?.message?._id;

    if (!threadId) {
      vscode.window.showErrorMessage("Failed to start discussion thread");
      return;
    }

    const rangeString = this._rangeToKey(thread.range);
    mappings.set(rangeString, threadId);

    // Add first reply to that thread
    const res = await this.provider.sendMessage(reply.text, threadId);
    this._appendCommentToThread(thread, reply.text, res?.message?.u?.username);
  }

  public async replyNote(reply: vscode.CommentReply) {
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

  public async refreshMsg(thread: vscode.CommentThread) {
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

    const res = await this.provider.getThreadMessages(threadId);

    thread.comments = [];
    res?.messages?.forEach((message: any) => {
      this._appendCommentToThread(thread, message.msg, message.u?.username);
    });
  }

  private _appendCommentToThread(
    thread: vscode.CommentThread,
    text: string,
    username?: string
  ) {
    const newComment = new BuzzComment(
      text,
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

  private _getSelectedText(): string {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return "";
    }

    const selection = editor.selection;
    if (!selection || selection.isEmpty) {
      return "";
    }

    const selectionRange = new vscode.Range(
      selection.start.line,
      selection.start.character,
      selection.end.line,
      selection.end.character
    );
    return editor.document.getText(selectionRange);
  }

  private _rangeToKey(range: vscode.Range): string {
    return `${range.start.line}-${range.start.character}-${range.end.line}-${range.end.character}`;
  }
}
