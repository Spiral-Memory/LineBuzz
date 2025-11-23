import * as vscode from "vscode";
import { ITeamRepository, TeamInfo } from "../../adapters/interfaces/ITeamRepository";
import { Storage } from "../platform/storage";
import { logger } from "../utils/logger";

export class TeamService {
    private currentTeam: TeamInfo | undefined;

    constructor(private teamRepo: ITeamRepository) { }

    public async initialize() {
        const storedTeam = Storage.getGlobal<TeamInfo>("currentTeam");
        if (storedTeam) {
            this.currentTeam = storedTeam;
            await this.updateContext(true);
            logger.info("TeamService", `Restored team: ${storedTeam.name}`);
        } else {
            await this.updateContext(false);
        }
    }

    public async createTeam(name: string): Promise<void> {
        try {
            const team = await this.teamRepo.createTeam(name);
            this.setTeam(team);
            vscode.window.showInformationMessage(`Team '${team.name}' created successfully!`);
        } catch (error: any) {
            logger.error("TeamService", "Error creating team", error);
            vscode.window.showErrorMessage(`Failed to create team: ${error.message}`);
            throw error;
        }
    }

    public async joinTeam(inviteCode: string): Promise<void> {
        try {
            const team = await this.teamRepo.joinTeam(inviteCode);
            this.setTeam(team);
            vscode.window.showInformationMessage(`Joined team '${team.name}' successfully!`);
        } catch (error: any) {
            logger.error("TeamService", "Error joining team", error);
            vscode.window.showErrorMessage(`Failed to join team: ${error.message}`);
            throw error;
        }
    }

    private setTeam(team: TeamInfo) {
        this.currentTeam = team;
        Storage.setGlobal("currentTeam", team);
        this.updateContext(true);
    }

    private async updateContext(hasTeam: boolean) {
        await vscode.commands.executeCommand('setContext', 'linebuzz.hasTeam', hasTeam);
    }

    public getTeam(): TeamInfo | undefined {
        return this.currentTeam;
    }
}
