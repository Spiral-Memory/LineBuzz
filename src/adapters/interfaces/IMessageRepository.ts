import { MessageResponse } from "../../shared/interfaces/IMessage";
import { MessageRequest } from "../../shared/interfaces/IMessage";


export interface IMessageRepository {
    sendMessage(message: MessageRequest, teamId: string): Promise<MessageResponse>;
    getMessages(teamId: string, limit?: number, offset?: number): Promise<MessageResponse[]>;
    subscribeToMessages(teamId: string, userId: string, callback: (message: MessageResponse) => void): Promise<{ unsubscribe: () => void }>;
}
