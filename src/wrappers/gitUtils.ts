import * as vscode from "vscode";
import * as path from "path";

function getGitRepository() {
  const gitExtension = vscode.extensions.getExtension("vscode.git")?.exports;
  if (!gitExtension) {
    return undefined;
  }

  const git = gitExtension.getAPI(1);
  if (git.repositories.length === 0) {
    return undefined;
  }

  const activeEditor = vscode.window.activeTextEditor;
  if (!activeEditor) {
    return undefined;
  }

  return git.repositories.find((repo: any) =>
    activeEditor.document.uri.fsPath.startsWith(repo.rootUri.fsPath)
  );
}

export function getOriginRemoteUrl(): string | undefined {
  const repo = getGitRepository();
  if (!repo) {
    return undefined;
  }

  const originRemote = repo.state.remotes.find(
    (remote: any) => remote.name === "origin"
  );
  return originRemote?.fetchUrl;
}

export function getCurrentCommitHash(): string | undefined {
  const repo = getGitRepository();
  if (!repo) {
    return undefined;
  }

  return repo.state.HEAD?.commit;
}

export function getRepoRelativePath(filePath: string): string | undefined {
  const repo = getGitRepository();
  if (!repo) {
    return undefined;
  }

  const repoRootPath = repo.rootUri.fsPath;
  return path.relative(repoRootPath, filePath);
}
