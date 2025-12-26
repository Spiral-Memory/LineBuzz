import { useEffect, useLayoutEffect, useState, useRef } from 'preact/hooks';
import { ChatInput } from '../../components/chat/ChatInput/ChatInput';
import { MessageRow } from '../../components/chat/MessageRow/MessageRow';
import { MessageResponse } from '../../../types/IMessage';
import { WelcomeSplash } from '../../components/chat/WelcomeSplash/WelcomeSplash';
import { LoadingSpinner } from '../../components/ui/Loaders/LoadingSpinner';
import { Snippet } from '../../../types/IAttachment';
import { vscode } from '../../utils/vscode';
import styles from './ChatView.module.css';

interface ChatViewProps {
    stagedSnippet?: Snippet[] | [];
    onClearSnippet?: () => void;
    onRemoveSnippet?: (index: number) => void;
    onOpenSnippet?: (snippet: Snippet) => void;
}

export const ChatView = ({ stagedSnippet, onClearSnippet, onRemoveSnippet, onOpenSnippet }: ChatViewProps) => {
    const [messages, setMessages] = useState<MessageResponse[]>([]);
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
                case 'loadInitialMessages':
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
                case 'appendMessage':
                    const msg = message.message;
                    setMessages(prev => [...prev, msg]);
                    setOffset(prev => prev + 1);

                    if (msg.userType === 'me') {
                        isAtBottomRef.current = true;
                    } else if (!isAtBottomRef.current) {
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
        <div class={styles['chat-view-container']} ref={chatContainerRef}>
            {messages.length === 0 ? (
                <div class={styles['splash-container']}>
                    <WelcomeSplash />
                </div>
            ) : (
                <div class={styles['message-list']} ref={messageListRef} onScroll={handleScroll}>
                    {isLoading && <LoadingSpinner />}
                    {messages.map((msg) => {
                        return (
                            <MessageRow message={msg} key={msg.message_id} />
                        );
                    })}
                    <div ref={messagesEndRef} />
                    {unreadCount > 0 && (
                        <div class={styles['new-messages-indicator']} onClick={scrollToBottom}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7 13L12 18L17 13M7 6L12 11L17 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            <span class={styles['indicator-count']}>{unreadCount}</span>
                        </div>
                    )}
                </div>
            )}
            <div class={styles['chat-input-container']}>
                <ChatInput
                    stagedSnippet={stagedSnippet}
                    onClearSnippet={onClearSnippet}
                    onRemoveSnippet={onRemoveSnippet}
                    onOpenSnippet={onOpenSnippet}
                />
            </div>
        </div>
    );
};