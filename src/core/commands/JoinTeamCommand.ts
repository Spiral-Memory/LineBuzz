import * as vscode from "vscode";
import { Container } from "../services/ServiceContainer";
import { Input } from "../platform/input";

export async function joinTeamCommand() {
    const inviteCode = await Input.showInputBox({
        placeHolder: "Enter invite code",
        prompt: "Join an existing team"
    });

    if (!inviteCode) {
        return;
    }

    const teamService = Container.get("TeamService");
    await teamService.joinTeam(inviteCode);
}
