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

const renderer = new marked.Renderer();

renderer.code = ({ text, lang }: { text: string, lang?: string }) => {
    let highlighted: string;
    let validLanguage: string;

    if (lang && hljs.getLanguage(lang)) {
        validLanguage = lang;
        try {
            highlighted = hljs.highlight(text, { language: validLanguage }).value;
        } catch (e) {
            highlighted = text;
        }
    } else {
        validLanguage = 'text';
        highlighted = text;
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



marked.use({
    renderer,
    breaks: true,
    gfm: true
});

export const MessageContent = ({ content, className = '' }: MessageContentProps) => {
    const htmlContent = useMemo(() => {
        try {
            const cleanContent = content.replace(/\\`/g, '`');
            const parsed = marked.parse(cleanContent, { async: false });
            return DOMPurify.sanitize(parsed as string, {
            });
        } catch (e) {
            console.error('Markdown rendering error:', e);
            return content;
        }
    }, [content]);

    return (
        <div
            class={`message-content markdown-body ${className}`}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
    );
};
