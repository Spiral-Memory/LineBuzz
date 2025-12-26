import { MessageContent } from '../MessageContent/MessageContent';
import { getInitials } from '../../../utils/getInitials';
import { formatTime } from '../../../utils/formatTime';
import { getAvatarColor } from '../../../utils/getAvatarColor';
import styles from './MessageRow.module.css';

interface MessageRowProps {
    message: any;
}

export const MessageRow = ({ message }: MessageRowProps) => {
    const displayName = message.u?.display_name || message.u?.username || 'Unknown';
    const avatarUrl = message.u?.avatar_url;
    const initials = getInitials(displayName);
    const avatarColor = getAvatarColor(displayName);
    const isMe = message.userType === 'me';

    return (
        <div class={`${styles['message-row']} ${isMe ? styles['message-row-me'] : ''}`} key={message.message_id}>
            <div class={styles['avatar-container']}>
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt={displayName}
                        class={styles['avatar-image']}
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            ((e.target as HTMLImageElement).nextElementSibling as HTMLElement).style.display = 'flex';
                        }}
                    />
                ) : null}
                <div
                    class={styles['avatar-fallback']}
                    style={{
                        display: avatarUrl ? 'none' : 'flex',
                        backgroundColor: avatarColor,
                        color: '#fff'
                    }}
                >
                    {initials}
                </div>
            </div>
            <div class={styles['message-body']}>
                <div class={styles['message-header']}>
                    {!isMe && <span class={styles['user-name']}>{displayName}</span>}
                    <span class={styles['message-time']}>{formatTime(message.created_at)}</span>
                </div>
                <MessageContent content={message.content} isMe={isMe} />
            </div>
        </div>
    );
};
