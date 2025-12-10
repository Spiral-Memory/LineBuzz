import { h } from 'preact';
import { useEffect, useState, useRef } from 'preact/hooks';
import { vscode } from '../../utils/vscode';
import { ChatInput } from '../../components/chat/ChatInput';
import './ChatView.css';

export const ChatView = () => {
    const [messages, setMessages] = useState<any[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
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
                case 'setCurrentUser':
                    setCurrentUserId(message.userId);
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
                        const isOwnMessage = currentUserId === msg.user_id;
                        return (
                            <div class={`message-wrapper ${isOwnMessage ? 'sent' : 'received'}`} key={msg.message_id}>
                                <div class="message-bubble">
                                    <div class="message-content">{msg.content}</div>
                                    <div class="message-meta">
                                        {/* Optional: Add timestamp or username if available */}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
            )}
            <ChatInput />
        </div>
    );
};