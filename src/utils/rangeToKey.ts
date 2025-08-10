import * as vscode from 'vscode';

export function rangeToKey(range: vscode.Range): string {
  return `${range.start.line}-${range.start.character}-${range.end.line}-${range.end.character}`;
}
