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
            logger.info("SupabaseMessageRepository", `Message sent successfully: ${response.message_id}`);
            return {
                id: response.message_id,
                thread_id: response.thread_id,
                parent_id: response.parent_id,
                is_code_thread: response.is_code_thread,
                team_id: response.team_id
            }
        }

        throw new Error(`Unexpected response status: ${response.status}`);
    }
}
