import { h } from 'preact';
import { useMemo } from 'preact/hooks';
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

    return (
        <div
            class={`message-content markdown-body ${className}`}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
    );
};
