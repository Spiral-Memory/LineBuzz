import { useMemo, useRef, useEffect } from 'preact/hooks';
import { marked } from 'marked';
import { encode as htmlEncode } from 'he';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import './MessageContent.css'

interface MessageContentProps {
    content: string;
    className?: string;
}

const renderer = new marked.Renderer();

renderer.code = ({ text, lang }: { text: string, lang?: string }) => {
    let highlighted: string;
    let validLanguage: string;

    if (lang && hljs.getLanguage(lang)) {
        validLanguage = (lang);
        try {
            highlighted = hljs.highlight(text, { language: validLanguage }).value;
        } catch (e) {
            highlighted = htmlEncode(text);
        }
    } else {
        validLanguage = 'text';
        highlighted = htmlEncode(text);
    }
    validLanguage = htmlEncode(validLanguage);

    return `
    <div class="code-block-wrapper">
        <div class="code-block-header">
            <span class="code-language">${validLanguage}</span>
            <button class="copy-code-btn" aria-label="Copy code">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" >
                    <path d="M6 11c0 -2.82843 0 -4.24264 0.87868 -5.12132C7.75736 5 9.17157 5 12 5h3c2.8284 0 4.2426 0 5.1213 0.87868C21 6.75736 21 8.17157 21 11v5c0 2.8284 0 4.2426 -0.8787 5.1213C19.2426 22 17.8284 22 15 22h-3c-2.82843 0 -4.24264 0 -5.12132 -0.8787C6 20.2426 6 18.8284 6 16v-5Z" stroke="currentColor" stroke-width="1.5"></path>
                    <path d="M6 19c-1.65685 0 -3 -1.3431 -3 -3v-6c0 -3.77124 0 -5.65685 1.17157 -6.82843C5.34315 2 7.22876 2 11 2h4c1.6569 0 3 1.34315 3 3" stroke="currentColor" stroke-width="1.5"></path>
                </svg>
            </button>
        </div>
        <div class="code-block-content">
            <pre><code class="hljs language-${validLanguage}">${highlighted}</code></pre>
        </div>
    </div>`;
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

export const MessageContent = ({ content, className = '' }: MessageContentProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const htmlContent = useMemo(() => {
        try {
            const parsed = marked.parse(content, { async: false });
            return DOMPurify.sanitize(parsed as string, {
                ADD_ATTR: ['target'],
                FORBID_TAGS: ['style', 'script'],
            });
        } catch (e) {
            console.error('Markdown rendering error:', e);
            return htmlEncode(content);
        }
    }, [content]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleCopy = async (e: Event) => {
            const target = (e.target as Element).closest('.copy-code-btn');
            if (!target) return;

            const button = target as HTMLButtonElement;
            const wrapper = button.closest('.code-block-wrapper');
            const codeElement = wrapper?.querySelector('code');

            if (codeElement) {
                const text = codeElement.innerText;
                try {
                    await navigator.clipboard.writeText(text);

                    const originalHTML = button.innerHTML;
                    button.innerHTML = `
                        <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13.2929 4.29289C13.6834 4.68342 13.6834 5.31658 13.2929 5.70711L7.29289 11.7071C6.90237 12.0976 6.2692 12.0976 5.87868 11.7071L2.70711 8.53553C2.31658 8.14501 2.31658 7.51184 2.70711 7.12132C3.09763 6.7308 3.7308 6.7308 4.12132 7.12132L6.58579 9.58579L11.8787 4.29289C12.2692 3.90237 12.9024 3.90237 13.2929 4.29289Z" fill="currentColor"></path>
                        </svg>
                    `;
                    button.classList.add('copied');

                    setTimeout(() => {
                        button.innerHTML = originalHTML;
                        button.classList.remove('copied');
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy text: ', err);
                }
            }
        };

        container.addEventListener('click', handleCopy);
        return () => container.removeEventListener('click', handleCopy);
    }, [htmlContent]);

    return (
        <div
            ref={containerRef}
            class={`message-content markdown-body ${className}`}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
    );
};
