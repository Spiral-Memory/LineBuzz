import * as vscode from "vscode";
import { WorkspaceStorage } from "../store/workspaceStorage";
import { getOriginRemoteUrl } from "../wrappers/gitUtils";
import { supabase } from "../infrastructure/api/supabaseClient";

export const repoContextService = {
  platform: "rocketchat",
  channel: "general",

  async linkWorkspace(serverUrl: string): Promise<void> {
    const remoteUrl = getOriginRemoteUrl();
    if (!remoteUrl) {
      throw new Error("No remote repository found with 'origin'.");
    }

    const success = await this.upsertContext(remoteUrl, serverUrl);
    if (!success) {
      throw new Error("Could not save the repository information to the server.");
    }

    const uuid = await this.fetchContextUuid(remoteUrl, serverUrl);
    if (!uuid) {
      throw new Error("Unable to retrieve repository information from the server.");
    }

    WorkspaceStorage.set(remoteUrl, uuid);
    console.log(`Linked workspace ${remoteUrl} with context UUID ${uuid}`);
    vscode.window.showInformationMessage(
      "Workspace context successfully linked with LineBuzz."
    );
  },

  async upsertContext(repo: string, serverUrl: string): Promise<boolean> {
    const { error } = await supabase.from("contexts").upsert(
      [
        {
          repo,
          platform: this.platform,
          server: serverUrl,
          channel: this.channel,
        },
      ],
      { onConflict: "repo,platform,server,channel", ignoreDuplicates: true }
    );

    return !error;
  },

  async fetchContextUuid(repo: string, serverUrl: string): Promise<string | null> {
    const { data, error } = await supabase
      .from("contexts")
      .select("uuid")
      .eq("repo", repo)
      .eq("platform", this.platform)
      .eq("server", serverUrl)
      .eq("channel", this.channel)
      .single();

    if (error || !data) {
      return null;
    }

    return data.uuid;
  },
};
