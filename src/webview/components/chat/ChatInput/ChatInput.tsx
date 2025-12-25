import { h } from 'preact';
import { useState, useRef } from 'preact/hooks';
import { vscode } from '../../../utils/vscode';
import { Snippet } from '../../../../core/types/ISnippet';
import { ChatAttachment } from '../ChatAttachment/CodeAttachment';
import './ChatInput.css';

interface ChatInputProps {
    stagedSnippet?: Snippet | null;
    onClearSnippet?: () => void;
}

export const ChatInput = ({ stagedSnippet, onClearSnippet }: ChatInputProps) => {
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
        if (!value.trim() && !stagedSnippet) return;
        let messageText = value;
        if (stagedSnippet) {
            const fileExtension = stagedSnippet.filePath.split('.').pop() || '';
            const snippetMarkdown = `\n\n\`\`\`${fileExtension}\n${stagedSnippet.content}\n\`\`\`\n`;
            messageText += snippetMarkdown;
        }

        vscode.postMessage({
            command: 'sendMessage',
            text: messageText
        });

        setValue('');
        if (onClearSnippet) {
            onClearSnippet();
        }

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
                    {stagedSnippet && onClearSnippet && (
                        <ChatAttachment snippet={stagedSnippet} onRemove={onClearSnippet} />
                    )}
                </div>
                <button class={`send-button-icon ${value.trim() || stagedSnippet ? 'has-text' : ''}`} onClick={handleSend} aria-label="Send">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                        <path
                            d="m18.6357 15.6701 1.7164 -5.1493c1.4995 -4.49838 2.2492 -6.74758 1.0619 -7.93485 -1.1872 -1.18726 -3.4364 -0.43753 -7.9348 1.06193L8.32987 5.36432C4.69923 6.57453 2.88392 7.17964 2.36806 8.06698c-0.49075 0.84414 -0.49075 1.88671 0 2.73082 0.51586 0.8874 2.33117 1.4925 5.96181 2.7027 0.58295 0.1943 0.87443 0.2915 1.11806 0.4546 0.23611 0.158 0.43894 0.3609 0.59697 0.597 0.1631 0.2436 0.2603 0.5351 0.4546 1.118 1.2102 3.6307 1.8153 5.446 2.7027 5.9618 0.8441 0.4908 1.8867 0.4908 2.7308 0 0.8874 -0.5158 1.4925 -2.3311 2.7027 -5.9618Z"
                            stroke="currentColor"
                            stroke-width="2"
                        />
                        <path
                            d="M16.2116 8.84823c0.2945 -0.29127 0.2971 -0.76613 0.0058 -1.06065 -0.2912 -0.29451 -0.7661 -0.29714 -1.0606 -0.00587l1.0548 1.06652Zm-5.549 5.48777 5.549 -5.48777 -1.0548 -1.06652 -5.54893 5.48779 1.05473 1.0665Z"
                            fill="currentColor"
                            stroke-width="2"
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
};