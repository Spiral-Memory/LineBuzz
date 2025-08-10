import * as vscode from "vscode";

export function getOriginRemoteUrl(): string | undefined {
  const gitExtension = vscode.extensions.getExtension("vscode.git")?.exports;
  if (!gitExtension) {
    return undefined;
  }

  const git = gitExtension.getAPI(1);
  if (git.repositories.length === 0) {
    return undefined;
  }

  const currentRepository = git.repositories[0];
  const originRemote = currentRepository.state.remotes.find((remote: any) => remote.name === "origin");

  return originRemote?.fetchUrl;
}
