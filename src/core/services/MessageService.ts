import * as vscode from "vscode";
import { IMessageRepository } from "../../adapters/interfaces/IMessageRepository";
import { logger } from "../utils/logger";
import { Container } from "./ServiceContainer";
import { MessageInfo } from "../../adapters/interfaces/IMessageRepository";

export class MessageService {
    constructor(private messageRepo: IMessageRepository) { }

    public async sendMessage(message: string): Promise<MessageInfo | void> {
        try {
            const teamService = Container.get("TeamService");
            const currentTeam = teamService.getTeam();

            if (!currentTeam) {
                vscode.window.showErrorMessage("You must join a team before sending a message.");
                return;
            }

            const deliveredMessage = await this.messageRepo.sendMessage(message, currentTeam.id);
            logger.info("MessageService", "Message sent successfully", deliveredMessage);
            return {
                ...deliveredMessage,
                userType: 'me'
            };
        } catch (error: any) {
            logger.error("MessageService", "Error sending message", error);
            vscode.window.showErrorMessage("Failed to send message. Please try again.");
        }
    }

    public async getMessages(): Promise<MessageInfo[]> {
        try {
            const teamService = Container.get("TeamService");
            const currentTeam = teamService.getTeam();

            if (!currentTeam) {
                vscode.window.showErrorMessage("Please join a team.");
                return [];
            }

            const authService = Container.get("AuthService");
            const [messages, session] = await Promise.all([
                this.messageRepo.getMessages(currentTeam.id),
                authService.getSession()
            ]);

            logger.info("MessageService", "Messages retrieved successfully", messages);

            return messages.map(msg => ({
                ...msg,
                userType: msg.u.user_id === session?.user_id ? 'me' : 'other'
            }));
        } catch (error: any) {
            logger.error("MessageService", "Error getting messages", error);
            vscode.window.showErrorMessage("Failed to get messages. Please try again.");
            return [];
        }
    }
}
