import * as vscode from "vscode";

function getGitRepository() {
  const gitExtension = vscode.extensions.getExtension("vscode.git")?.exports;
  if (!gitExtension) {
    return undefined;
  }

  const git = gitExtension.getAPI(1);
  if (git.repositories.length === 0) {
    return undefined;
  }

  return git.repositories[0];
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
