import * as vscode from "vscode";

export function parseRangeString(
  rangeString: string,
  document: vscode.TextDocument
): vscode.Range | undefined {
  const parts = rangeString.split("-");
  if (parts.length !== 4) {
    return undefined;
  }

  const [startLineStr, startCharStr, endLineStr, endCharStr] = parts;

  const startLine = Number(startLineStr);
  const startChar = Number(startCharStr);
  const endLine = Number(endLineStr);
  const endChar = Number(endCharStr);

  if (
    [startLine, startChar, endLine, endChar].some(
      (num) => isNaN(num) || num < 0
    )
  ) {
    return undefined;
  }

  if (startLine >= document.lineCount || endLine >= document.lineCount) {
    return undefined;
  }

  if (endLine < startLine || (endLine === startLine && endChar < startChar)) {
    return undefined;
  }

  return new vscode.Range(startLine, startChar, endLine, endChar);
}
