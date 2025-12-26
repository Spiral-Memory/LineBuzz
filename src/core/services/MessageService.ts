import * as vscode from "vscode";
import { IMessageRepository } from "../../adapters/interfaces/IMessageRepository";
import { logger } from "../utils/logger";
import { Container } from "./ServiceContainer";
import { MessageResponse, MessageRequest} from "../../types/IMessage";

export class MessageService {
    constructor(private messageRepo: IMessageRepository) { }

    public async sendMessage(message: MessageRequest): Promise<MessageResponse | void> {
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


    public async getMessages(limit?: number, offset?: number): Promise<MessageResponse[]> {
        try {
            const teamService = Container.get("TeamService");
            const currentTeam = teamService.getTeam();

            if (!currentTeam) {
                vscode.window.showErrorMessage("Please join a team.");
                return [];
            }

            const authService = Container.get("AuthService");
            const [messages, session] = await Promise.all([
                this.messageRepo.getMessages(currentTeam.id, limit, offset),
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
    public async subscribeToMessages(postMessage: (message: MessageResponse) => void): Promise<{ unsubscribe: () => void } | void> {
        try {
            const teamService = Container.get("TeamService");
            const currentTeam = teamService.getTeam();

            if (!currentTeam) {
                return;
            }

            const authService = Container.get("AuthService");
            const session = await authService.getSession();

            if (!session) {
                return;
            }

            const subscription = await this.messageRepo.subscribeToMessages(currentTeam.id, session?.user_id, (message) => {
                const enrichedMessage = {
                    ...message,
                    userType: message.u.user_id === session?.user_id ? 'me' : 'other'
                } as MessageResponse;
                postMessage(enrichedMessage);
            });

            logger.info("MessageService", `Subscribed to messages for team ${currentTeam.id}`);
            return subscription;

        } catch (error: any) {
            logger.error("MessageService", "Error subscribing to messages", error);
        }
    }
}
