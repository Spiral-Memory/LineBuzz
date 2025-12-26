import { MessageInfo } from "../../shared/interfaces/IMessageInfo";

export interface IMessageRepository {
    sendMessage(message: string, teamId: string): Promise<MessageInfo>;
    getMessages(teamId: string, limit?: number, offset?: number): Promise<MessageInfo[]>;
    subscribeToMessages(teamId: string, userId: string, callback: (message: MessageInfo) => void): Promise<{ unsubscribe: () => void }>;
}
