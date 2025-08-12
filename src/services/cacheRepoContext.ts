import * as vscode from "vscode";
import { WorkspaceStorage } from "../store/workspaceStorage";
import { getOriginRemoteUrl } from "../wrappers/gitUtils";
import { supabase } from "../infrastructure/api/supabaseClient";

export async function cacheRepoContext(
  serverUrl: string,
): Promise<void> {


  const remoteUrl = getOriginRemoteUrl();
  if (!remoteUrl) {
    vscode.window.showErrorMessage(
      "Origin remote URL not found or Git extension not available"
    );
    return;
  }

  const { error: upsertError } = await supabase.from("contexts").upsert(
    [
      {
        repo: remoteUrl,
        platform: "rocketchat",
        server: serverUrl,
        channel: "general",
      },
    ],
    { onConflict: "repo,platform,server,channel", ignoreDuplicates: true }
  );

  if (upsertError) {
    console.error("Failed to save context:", upsertError);
    vscode.window.showErrorMessage("Failed to save workspace context");
    return;
  }

  const { data, error: fetchError } = await supabase
    .from("contexts")
    .select("uuid")
    .eq("repo", remoteUrl)
    .eq("platform", "rocketchat")
    .eq("server", serverUrl)
    .eq("channel", "general")
    .single();

  if (fetchError || !data) {
    console.error("Failed to fetch context UUID:", fetchError);
    vscode.window.showErrorMessage("Failed to fetch workspace context UUID");
    return;
  }
  WorkspaceStorage.set(remoteUrl, data.uuid);
}
