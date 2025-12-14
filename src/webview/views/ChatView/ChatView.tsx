import { h } from 'preact';
import { useEffect, useState, useRef } from 'preact/hooks';
import { ChatInput } from '../../components/chat/ChatInput';
import { vscode } from '../../utils/vscode';
import { getInitials } from '../../utils/getInitials';
import { formatTime } from '../../utils/formatTime';
import { getAvatarColor } from '../../utils/getAvatarColor';
import './ChatView.css';

export const ChatView = () => {
    const [messages, setMessages] = useState<any[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const message = event.data;
            switch (message.command) {
                case 'updateMessages':
                    setMessages(message.messages);
                    break;
                case 'addMessage':
                    setMessages(prev => [...prev, message.message]);
                    break;
            }
        };

        window.addEventListener('message', handleMessage);
        vscode.postMessage({ command: 'getMessages' });

        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, []);

    return (
        <div class="chat-view-container">
            {messages.length === 0 ? (
                <div class="center-content">
                    <div class="art-decoration">
                        <svg width="200" height="200" viewBox="40 40 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M70 60 C50 60 50 80 50 100 C50 120 50 140 70 140"
                                stroke="currentColor"
                                stroke-width="12"
                                stroke-linecap="round"
                                fill="none" />
                            <path d="M130 60 C150 60 150 80 150 100 C150 120 150 140 130 140"
                                stroke="currentColor"
                                stroke-width="12"
                                stroke-linecap="round"
                                fill="none" />
                            <line x1="75" y1="90" x2="125" y2="90" stroke="currentColor" stroke-width="8" stroke-linecap="round" />
                            <line x1="75" y1="110" x2="105" y2="110" stroke="currentColor" stroke-width="8" stroke-linecap="round" />
                        </svg>
                    </div>
                    <h1 class="welcome-title">LineBuzz</h1>
                    <p class="welcome-desc">Discuss efforts, define logic, and stay in sync.</p>
                </div>
            ) : (
                <div class="message-list">
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
                                    <div class="message-content">{msg.content}</div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
            )}
            <div class="chat-input-container">
                <ChatInput />
            </div>
        </div>
    );
};