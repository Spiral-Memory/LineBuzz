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
            p_is_code_thread: false
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
            return {
            ...response.message,
            userType: 'me'
        };
        }

        throw new Error(`Unexpected response status: ${response.status}`);
    }

    async getMessages(teamId: string): Promise<MessageInfo[]> {
        const supabase = SupabaseClient.getInstance().client;
        logger.info("SupabaseMessageRepository", `Getting messages for team: ${teamId}`);

        const { data, error } = await supabase.rpc('get_messages', {
            p_team_id: teamId
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
            logger.info("SupabaseMessageRepository", `Messages retrieved successfully: ${response.messages?.length}`);
            return response.messages;
        }

        throw new Error(`Unexpected response status: ${response.status}`);
    }
}
