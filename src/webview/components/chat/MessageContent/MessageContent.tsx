import { h } from 'preact';
import { useMemo } from 'preact/hooks';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import './MessageContent.css'

interface MessageContentProps {
    content: string;
    className?: string;
}

const htmlEncode = (unsafe: string) => {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

const renderer = new marked.Renderer();

renderer.code = ({ text, lang }: { text: string, lang?: string }) => {
    let highlighted: string;
    let validLanguage: string;

    if (lang && hljs.getLanguage(lang)) {
        validLanguage = lang;
        try {
            highlighted = hljs.highlight(text, { language: validLanguage }).value;
        } catch (e) {
            highlighted = htmlEncode(text);
        }
    } else {
        validLanguage = 'text';
        highlighted = htmlEncode(text);
    }

    return `
<div class="code-block-wrapper">
    <div class="code-block-header">
        <span class="code-language">${validLanguage}</span>
    </div>
    <div class="code-block-content">
        <pre><code class="hljs language-${validLanguage}">${highlighted}</code></pre>
    </div>
</div>`;
};

renderer.html = ({ text }: { text: string }) => htmlEncode(text);
renderer.link = ({ href, title, text }: { href: string, title?: string | null, text: string }) => {
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" title="${title || ''}">${text}</a>`;
};



marked.use({
    renderer,
    breaks: true,
    gfm: true
});

export const MessageContent = ({ content, className = '' }: MessageContentProps) => {
    const htmlContent = useMemo(() => {
        try {
            const parsed = marked.parse(content, { async: false });
            return DOMPurify.sanitize(parsed as string, {
                ADD_ATTR: ['target', 'class']
            });
        } catch (e) {
            console.error('Markdown rendering error:', e);
            return htmlEncode(content);
        }
    }, [content]);

    return (
        <div
            class={`message-content markdown-body ${className}`}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
    );
};
