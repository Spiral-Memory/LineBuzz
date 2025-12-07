import * as vscode from "vscode";
import { IMessageRepository } from "../../adapters/interfaces/IMessageRepository";
import { logger } from "../utils/logger";
import { Container } from "./ServiceContainer";

export class MessageService {
    constructor(private messageRepo: IMessageRepository) { }

    public async sendMessage(message: string): Promise<void> {
        try {
            const teamService = Container.get("TeamService");
            const currentTeam = teamService.getTeam();

            if (!currentTeam) {
                vscode.window.showErrorMessage("You must join a team before sending a message.");
                return;
            }

            await this.messageRepo.sendMessage(message, currentTeam.id);
        } catch (error: any) {
            logger.error("MessageService", "Error sending message", error);
            vscode.window.showErrorMessage("Failed to send message. Please try again.");
        }
    }
}
