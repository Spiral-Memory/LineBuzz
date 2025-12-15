import { h } from 'preact';
import { useEffect, useLayoutEffect, useState, useRef } from 'preact/hooks';

import { ChatInput } from '../../components/chat/ChatInput/ChatInput';
import { MessageContent } from '../../components/chat/MessageContent/MessageContent';
import { vscode } from '../../utils/vscode';
import { getInitials } from '../../utils/getInitials';
import { formatTime } from '../../utils/formatTime';
import { getAvatarColor } from '../../utils/getAvatarColor';
import { WelcomeSplash } from '../../components/ui/WelcomeSplash';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import './ChatView.css';

export const ChatView = () => {
    const [messages, setMessages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [offset, setOffset] = useState(0);
    const [unreadCount, setUnreadCount] = useState(0);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const messageListRef = useRef<HTMLDivElement>(null);
    const prevScrollHeightRef = useRef<number>(0);
    const isPrependingRef = useRef(false);
    const isAtBottomRef = useRef(true);

    const LIMIT = 50;

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
            setUnreadCount(0);
        }
    };

    useLayoutEffect(() => {
        if (isPrependingRef.current && messageListRef.current) {
            const newScrollHeight = messageListRef.current.scrollHeight;
            const diff = newScrollHeight - prevScrollHeightRef.current;
            messageListRef.current.scrollTop = diff;
            isPrependingRef.current = false;
        } else if (!isPrependingRef.current && offset === 0) {
            scrollToBottom();
        } else if (!isPrependingRef.current) {
            if (isAtBottomRef.current) {
                scrollToBottom();
            }
        }
    }, [messages]);

    const loadMoreMessages = () => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);
        if (messageListRef.current) {
            prevScrollHeightRef.current = messageListRef.current.scrollHeight;
            isPrependingRef.current = true;
        }

        vscode.postMessage({
            command: 'getMessages',
            limit: LIMIT,
            offset: messages.length
        });
    };

    const handleScroll = () => {
        if (!messageListRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = messageListRef.current;

        const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
        isAtBottomRef.current = isAtBottom;

        if (isAtBottom && unreadCount > 0) {
            setUnreadCount(0);
        }

        if (scrollTop === 0) {
            loadMoreMessages();
        }
    };

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const message = event.data;
            switch (message.command) {
                case 'updateMessages':
                    setMessages(message.messages);
                    setOffset(message.messages.length);
                    setHasMore(message.messages.length >= LIMIT);
                    setIsLoading(false);
                    isPrependingRef.current = false;
                    break;
                case 'prependMessages':
                    const newMessages = message.messages;
                    setMessages(prev => [...newMessages, ...prev]);
                    setHasMore(newMessages.length >= LIMIT);
                    setIsLoading(false);
                    break;
                case 'addMessage':
                    const msg = message.message;
                    setMessages(prev => [...prev, msg]);
                    setOffset(prev => prev + 1);

                    if (!isAtBottomRef.current && msg.userType !== 'me') {
                        setUnreadCount(prev => prev + 1);
                    }
                    break;
            }
        };

        window.addEventListener('message', handleMessage);

        vscode.postMessage({ command: 'getMessages', limit: LIMIT, offset: 0 });

        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, []);

    return (
        <div class="chat-view-container" ref={chatContainerRef}>
            {messages.length === 0 ? (
                <div class="splash-container">
                    <WelcomeSplash />
                </div>
            ) : (
                <div class="message-list" ref={messageListRef} onScroll={handleScroll}>
                    {isLoading && <LoadingSpinner />}
                    {messages.map((msg) => {
                        const displayName = msg.u?.display_name || msg.u?.username || 'Unknown';
                        const avatarUrl = msg.u?.avatar_url;
                        const initials = getInitials(displayName);
                        const avatarColor = getAvatarColor(displayName);

                        return (
                            <div class={`message-row ${msg.userType === 'me' ? 'message-row-me' : ''}`} key={msg.message_id}>
                                <div class="avatar-container">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt={displayName} class="avatar-image" onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                            ((e.target as HTMLImageElement).nextElementSibling as HTMLElement).style.display = 'flex';
                                        }} />
                                    ) : null}
                                    <div class="avatar-fallback" style={{ display: avatarUrl ? 'none' : 'flex', backgroundColor: avatarColor, color: '#fff' }}>
                                        {initials}
                                    </div>
                                </div>
                                <div class="message-body">
                                    <div class="message-header">
                                        {msg.userType !== 'me' && <span class="user-name">{displayName}</span>}
                                        <span class="message-time">{formatTime(msg.created_at)}</span>
                                    </div>
                                    <MessageContent content={msg.content} />
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                    {unreadCount > 0 && (
                        <div class="new-messages-indicator" onClick={scrollToBottom}>
                            <span>↓ ({unreadCount})</span>
                        </div>
                    )}
                </div>
            )}
            <div class="chat-input-container">
                <ChatInput />
            </div>
        </div >
    );
};