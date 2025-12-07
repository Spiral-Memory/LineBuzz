import { h } from 'preact';
import { ChatInput } from '../../components/chat/ChatInput';
import './ChatView.css';

export const ChatView = () => { 
    return (
        <div class="chat-view-container">
            <div class="center-content">
                <div class="art-decoration">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM4 16V4h16v12H4z" />
                        <path d="M6 12h8v-2H6v2zm0-3h12V7H6v2z" />
                    </svg>
                </div>
                <h1 class="welcome-title">LineBuzz</h1>
                <p class="welcome-desc">
                    Connect with your team instantly.<br />
                    Share snippets, discuss logic, and stay in sync.
                </p>
            </div>
            <ChatInput />
        </div>
    );
};