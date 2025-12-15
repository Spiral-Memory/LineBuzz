export interface MessageInfo {
    message_id: string;
    thread_id: string;
    parent_id: string | null;
    is_code_thread: boolean;
    content: string;
    created_at: string;
    u: {
        user_id: string;
        username: string;
        display_name: string;
        avatar_url: string;
    };
    userType?: 'me' | 'other';
}

export interface IMessageRepository {
    sendMessage(message: string, teamId: string): Promise<MessageInfo>;
    getMessages(teamId: string, limit?: number, offset?: number): Promise<MessageInfo[]>;
    subscribeToMessages(teamId: string, userId: string, callback: (message: MessageInfo) => void): Promise<{ unsubscribe: () => void }>;
}
