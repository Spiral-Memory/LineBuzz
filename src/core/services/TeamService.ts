import * as vscode from "vscode";
import { ITeamRepository, TeamInfo } from "../../adapters/interfaces/ITeamRepository";
import { Storage } from "../platform/storage";
import { logger } from "../utils/logger";

export class TeamService {
    private currentTeam: TeamInfo | undefined;

    private _onDidChangeTeam = new vscode.EventEmitter<TeamInfo | undefined>();
    public readonly onDidChangeTeam = this._onDidChangeTeam.event;

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
            if (!team.invite_code) {
                logger.error("TeamService", "No invite code was generated.");
                throw new Error("No invite code was generated.");
            }
            const selection = await vscode.window.showInformationMessage(
                `Team '${team.name}' created successfully! Invite Code: ${team.invite_code}`,
                // { modal: true }, 
                'Copy Invite Code'
            );
            // TOOO: Once UI is ready, we may provide an option to retreive invite code per team
            if (selection === 'Copy Invite Code') {
                await vscode.env.clipboard.writeText(`Join my team '${team.name}' on LineBuzz using this invite code: ${team.invite_code!}`);
                vscode.window.showInformationMessage("All set. Invite code is ready to share.");
            }
            this.setTeam(team);
        } catch (error: any) {
            logger.error("TeamService", "Error creating team", error);
            vscode.window.showErrorMessage("Failed to create team. Please try again.");
        }
    }

    public async joinTeam(inviteCode: string): Promise<void> {
        try {
            const team = await this.teamRepo.joinTeam(inviteCode);
            this.setTeam(team);
            vscode.window.showInformationMessage(`Joined team '${team.name}' successfully!`);
        } catch (error: any) {
            logger.error("TeamService", "Error joining team", error);
            vscode.window.showErrorMessage("Failed to join team. Please try again.");
        }
    }

    public async leaveTeam(showMessage: boolean = true): Promise<void> {
        this.currentTeam = undefined;
        Storage.deleteGlobal("currentTeam");
        await this.updateContext(false);
        this._onDidChangeTeam.fire(undefined);
        if (showMessage) {
            vscode.window.showInformationMessage("You have left the team.");
        }
    }

    private setTeam(team: TeamInfo) {
        this.currentTeam = team;
        Storage.setGlobal("currentTeam", team);
        this.updateContext(true);
        this._onDidChangeTeam.fire(team);
    }

    private async updateContext(hasTeam: boolean) {
        await vscode.commands.executeCommand('setContext', 'linebuzz.hasTeam', hasTeam);
    }

    public getTeam(): TeamInfo | undefined {
        return this.currentTeam;
    }
}
