import * as vscode from 'vscode';

export class TeamFeedProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    public static readonly viewId = 'linebuzz.teamfeed';
    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: vscode.TreeItem): Thenable<vscode.TreeItem[]> {
        if (element) {
            return Promise.resolve([]);
        }

        const item = new vscode.TreeItem('Hello from Team Feed');
        return Promise.resolve([item]);
    }
}
