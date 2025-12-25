import { h } from 'preact';
import { MessageContent } from '../MessageContent/MessageContent';
import { getInitials } from '../../../utils/getInitials';
import { formatTime } from '../../../utils/formatTime';
import { getAvatarColor } from '../../../utils/getAvatarColor';
import './MessageRow.css';

interface MessageRowProps {
    message: any; // We'll keep 'any' for now to match ChatView state
}

export const MessageRow = ({ message }: MessageRowProps) => {
    const displayName = message.u?.display_name || message.u?.username || 'Unknown';
    const avatarUrl = message.u?.avatar_url;
    const initials = getInitials(displayName);
    const avatarColor = getAvatarColor(displayName);
    const isMe = message.userType === 'me';

    return (
        <div class={`message-row ${isMe ? 'message-row-me' : ''}`} key={message.message_id}>
            <div class="avatar-container">
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt={displayName}
                        class="avatar-image"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            ((e.target as HTMLImageElement).nextElementSibling as HTMLElement).style.display = 'flex';
                        }}
                    />
                ) : null}
                <div
                    class="avatar-fallback"
                    style={{
                        display: avatarUrl ? 'none' : 'flex',
                        backgroundColor: avatarColor,
                        color: '#fff'
                    }}
                >
                    {initials}
                </div>
            </div>
            <div class="message-body">
                <div class="message-header">
                    {!isMe && <span class="user-name">{displayName}</span>}
                    <span class="message-time">{formatTime(message.created_at)}</span>
                </div>
                <MessageContent content={message.content} />
            </div>
        </div>
    );
};
