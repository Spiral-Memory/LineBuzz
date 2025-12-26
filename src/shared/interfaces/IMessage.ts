export interface MessageResponse {
    message_id: string;
    thread_id: string;
    parent_id: string | null;
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

export interface MessageRequest {
    content: string;
}