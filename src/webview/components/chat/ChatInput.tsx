import { h } from 'preact';
import { useState, useRef } from 'preact/hooks';
import './ChatInput.css';

export const ChatInput = () => {
    const [value, setValue] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleInput = (e: any) => {
        setValue(e.target.value);
        adjustHeight();
    };

    const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
            textarea.style.overflowY = textarea.scrollHeight > 120 ? 'auto' : 'hidden';
        }
    };

    const handleSend = () => {
        if (!value.trim()) return;
        console.log('Sending message:', value);

        setValue('');

        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.overflowY = 'hidden';
            textareaRef.current.focus();
        }
    };
 
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div class="input-container">
            <textarea
                ref={textareaRef}
                class="chat-input"
                value={value}
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
            />
            <div class="input-actions">
                <div class="left-actions">
                </div>
                <button class="send-button-icon" onClick={handleSend} aria-label="Send">
                    <svg viewBox="0 0 24 24" class="icon">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                </button>
            </div>
        </div>
    );
};