import * as vscode from "vscode";
import { Container } from "../services/ServiceContainer";

export async function leaveTeamCommand() {
    const confirm = await vscode.window.showWarningMessage(
        "Are you sure you want to leave the team?",
        { modal: true },
        "Yes",
        "No"
    );

    if (confirm !== "Yes") {
        return;
    }

    const teamService = Container.get("TeamService");
    await teamService.leaveTeam();
}
