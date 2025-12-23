import { IMessageRepository, MessageInfo } from "../interfaces/IMessageRepository";
import { SupabaseClient } from "./SupabaseClient";
import { logger } from "../../core/utils/logger";

export class SupabaseMessageRepository implements IMessageRepository {
    async sendMessage(message: string, teamId: string): Promise<MessageInfo> {
        const supabase = SupabaseClient.getInstance().client;
        logger.info("SupabaseMessageRepository", `Sending message: ${message} in team: ${teamId}`);

        const { data, error } = await supabase.rpc('create_message', {
            p_team_id: teamId,
            p_parent_id: null,
            p_content: message,
        });
        if (error) {
            logger.error("SupabaseMessageRepository", "RPC call failed", error);
            throw new Error(`RPC call failed: ${error.message}`);
        }

        const response = data as any;

        if (response.status === 'error') {
            throw new Error(response.message);
        }

        if (response.status === 'success') {
            logger.info("SupabaseMessageRepository", `Message sent successfully: ${response.message?.message_id}`);
            return response.message;
        }

        throw new Error(`Unexpected response status: ${response.status}`);
    }

    async getMessages(teamId: string, limit: number = 50, offset: number = 0): Promise<MessageInfo[]> {
        const supabase = SupabaseClient.getInstance().client;
        logger.info("SupabaseMessageRepository", `Getting messages for team: ${teamId} limit: ${limit} offset: ${offset}`);

        const { data, error } = await supabase.rpc('get_messages', {
            p_team_id: teamId,
            p_limit: limit,
            p_offset: offset
        });

        if (error) {
            logger.error("SupabaseMessageRepository", "RPC call failed", error);
            throw new Error(`RPC call failed: ${error.message}`);
        }
        const response = data as any;
        if (response.status === 'error') {
            throw new Error(response.message);
        }

        if (response.status === 'success' && Array.isArray(response.messages)) {
            logger.info("SupabaseMessageRepository", `Messages retrieved successfully: ${response.messages.length}`);
            return response.messages;
        }

        logger.warn("SupabaseMessageRepository", "Unexpected response format", response);
        return [];
    }

    async subscribeToMessages(teamId: string, userId: string, callback: (message: MessageInfo) => void): Promise<{ unsubscribe: () => void }> {
        const supabase = SupabaseClient.getInstance().client;
        logger.info("SupabaseMessageRepository", `Subscribing to messages for team: ${teamId}`);

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
            await supabase.realtime.setAuth(session.access_token);
        }

        const channel = supabase
            .channel(`messages-team-${teamId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `team_id=eq.${teamId}`
                },
                async (payload) => {
                    logger.info("SupabaseMessageRepository", 'Realtime payload received', payload);

                    if (!payload.new || !payload.new.id) {
                        logger.warn("SupabaseMessageRepository", "Payload missing message_id");
                        return;
                    }

                    if (payload.new.user_id === userId) {
                        logger.info("SupabaseMessageRepository", "Message is from current user, skipping");
                        return;
                    }

                    const { data, error } = await supabase.rpc('get_message_by_id', {
                        p_team_id: teamId,
                        p_message_id: payload.new.id
                    });

                    if (error) {
                        logger.error("SupabaseMessageRepository", "Failed to get message details", error);
                        return;
                    }

                    const response = data as any;
                    if (response.status === 'success' && response.message) {
                        callback(response.message);
                    }
                }
            )
            .subscribe((status) => {
                logger.info("SupabaseMessageRepository", `Subscription status for team ${teamId}: ${status}`);
            });

        return {
            unsubscribe: () => {
                logger.info("SupabaseMessageRepository", `Unsubscribing from messages for team: ${teamId}`);
                channel.unsubscribe();
            }
        };
    }
}
