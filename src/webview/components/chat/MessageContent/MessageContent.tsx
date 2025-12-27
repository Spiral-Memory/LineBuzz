import { useMemo, useRef, useEffect } from 'preact/hooks';
import { marked } from 'marked';
import hljs from 'highlight.js';
import { encode as htmlEncode } from 'he';
import DOMPurify from 'dompurify';
import styles from './MessageContent.module.css';
import { renderSnippet } from '../MessageAttachment/CodeAttachment';

interface MessageContentProps {
    content: string | null;
    className?: string;
    isMe?: boolean;
}

const renderer = new marked.Renderer();

renderer.code = ({ text, lang }: { text: string, lang?: string }) => {
    let highlightedText: string;
    let validLanguage: string;

    if (lang && hljs.getLanguage(lang)) {
        validLanguage = (lang);
        try {
            highlightedText = hljs.highlight(text, { language: validLanguage }).value;
        } catch (e) {
            highlightedText = htmlEncode(text);
        }
    } else {
        validLanguage = 'text';
        highlightedText = htmlEncode(text);
    }
    validLanguage = htmlEncode(validLanguage);
    return renderSnippet({ validLanguage, highlightedText });
};

renderer.html = ({ text }: { text: string }) => htmlEncode(text);
renderer.link = ({ href, title, text }: { href: string, title?: string | null, text: string }) => {
    const safeHref = htmlEncode(href);
    const safeTitle = title ? htmlEncode(title) : '';
    return `<a href="${safeHref}" title="${safeTitle}" target="_blank" rel="noopener noreferrer">${text}</a>`;
};


marked.use({
    renderer,
    breaks: true,
    gfm: true
});


export const MessageContent = ({ content, className = '', isMe = false }: MessageContentProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const htmlContent = useMemo(() => {
        try {
            const parsed = marked.parse(content || '', { async: false });
            return DOMPurify.sanitize(parsed as string, {
                ADD_ATTR: ['target'],
                FORBID_TAGS: ['style', 'script'],
            });
        } catch (e) {
            console.error('Markdown rendering error:', e);
            return htmlEncode(content || '');
        }
    }, [content]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleClick = async (e: Event) => {
            const target = e.target as Element;
            const copyBtn = target.closest('.copy-code-btn');
            const toggleBtn = target.closest('.toggle-code-btn');

            if (copyBtn) {
                const button = copyBtn as HTMLButtonElement;
                const wrapper = button.closest('.code-block-wrapper');
                const codeElement = wrapper?.querySelector('code');

                if (codeElement) {
                    const text = codeElement.innerText;
                    try {
                        await navigator.clipboard.writeText(text);

                        const originalCopyHTML = button.innerHTML;
                        button.innerHTML = `
                            <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13.2929 4.29289C13.6834 4.68342 13.6834 5.31658 13.2929 5.70711L7.29289 11.7071C6.90237 12.0976 6.2692 12.0976 5.87868 11.7071L2.70711 8.53553C2.31658 8.14501 2.31658 7.51184 2.70711 7.12132C3.09763 6.7308 3.7308 6.7308 4.12132 7.12132L6.58579 9.58579L11.8787 4.29289C12.2692 3.90237 12.9024 3.90237 13.2929 4.29289Z" fill="currentColor"></path>
                            </svg>
                        `;
                        button.classList.add('copied');

                        setTimeout(() => {
                            button.innerHTML = originalCopyHTML;
                            button.classList.remove('copied');
                        }, 2000);
                    } catch (err) {
                        console.error('Failed to copy text: ', err);
                    }
                }
            } else if (toggleBtn) {
                const button = toggleBtn as HTMLButtonElement;
                const wrapper = button.closest('.code-block-wrapper') as HTMLElement;

                if (wrapper) {
                    wrapper.classList.toggle('collapsed');
                    const isCollapsed = wrapper.classList.contains('collapsed');

                    if (isCollapsed) {
                        button.innerHTML = `
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        `;
                    } else {
                        button.innerHTML = `
                             <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 15L12 9L6 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        `;
                    }
                }
            }
        };

        container.addEventListener('click', handleClick);
        return () => container.removeEventListener('click', handleClick);
    }, [htmlContent]);

    return (
        <div
            ref={containerRef}
            class={`${styles['message-content']} ${isMe ? styles['is-me'] : ''} ${styles['markdown-body']} ${className}`}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
    );
};
