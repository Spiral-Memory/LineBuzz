import { Snippet } from '../../../../core/types/ISnippet';
import styles from './CodeAttachment.module.css';
import FileIcon from '../../ui/FileIcon/FileIcon';

interface ChatAttachmentProps {
    snippet: Snippet;
    onRemove: () => void;
}

export const ChatAttachment = ({ snippet, onRemove }: ChatAttachmentProps) => {
    const fileName = snippet.filePath.split('/').pop() || '';
    return (
        <div class={styles['chat-attachment']}>
            <div class={styles['attachment-icon']}>
                <FileIcon filename={fileName} height="16px" width="16px" />
            </div>
            <div class={styles['attachment-info']}>
                <span class={styles['file-name']}>{fileName}</span>
                <span class={styles['line-range']}>:{snippet.startLine}-{snippet.endLine}</span>
            </div>
            <button class={styles['remove-button']} onClick={onRemove} aria-label="Remove attachment">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
    );
};
