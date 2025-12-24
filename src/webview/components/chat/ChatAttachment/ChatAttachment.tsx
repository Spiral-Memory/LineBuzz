import { h } from 'preact';
import { Snippet } from '../../../../core/types/ISnippet';
import './ChatAttachment.css';

interface ChatAttachmentProps {
    snippet: Snippet;
    onRemove: () => void;
}

export const ChatAttachment = ({ snippet, onRemove }: ChatAttachmentProps) => {
    return (
        <div class="chat-attachment">
            <div class="attachment-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                </svg>
            </div>
            <div class="attachment-info">
                <span class="file-name">{snippet.filePath.split('/').pop()}</span>
                <span class="line-range">:{snippet.startLine}-{snippet.endLine}</span>
            </div>
            <button class="remove-button" onClick={onRemove} aria-label="Remove attachment">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
    );
};
