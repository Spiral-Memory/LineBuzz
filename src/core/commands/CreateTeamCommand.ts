import * as vscode from "vscode";
import { Container } from "../services/ServiceContainer";
import { Input } from "../platform/input";

export async function createTeamCommand() {
    const name = await Input.showInputBox({
        placeHolder: "Enter team name",
        prompt: "Create a new team"
    });

    if (!name) {
        return;
    }

    const teamService = Container.get("TeamService");
    await teamService.createTeam(name);
}
