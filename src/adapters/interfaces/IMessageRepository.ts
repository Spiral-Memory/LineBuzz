export interface MessageInfo {
    message_id: string;
    thread_id: string;
    parent_id: string | null;
    is_code_thread: boolean;
    content: string;
    team_id: string;
    user_id: string;
    created_at: string;
}

export interface IMessageRepository {
    sendMessage(message: string, teamId: string): Promise<MessageInfo>;
    getMessages(teamId: string): Promise<MessageInfo[]>;
}
