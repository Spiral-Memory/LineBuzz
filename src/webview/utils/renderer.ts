export const renderSnippet = ({ validLanguage, highlightedText }: { validLanguage: string, highlightedText: string }) => {
    return (
        `<div class="code-block-wrapper">
         <div class="code-block-header">
            <span class="code-metadata">${validLanguage}</span>
            <div class="header-actions">
                <button class="copy-code-btn" aria-label="Copy code">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" >
                        <path d="M6 11c0 -2.82843 0 -4.24264 0.87868 -5.12132C7.75736 5 9.17157 5 12 5h3c2.8284 0 4.2426 0 5.1213 0.87868C21 6.75736 21 8.17157 21 11v5c0 2.8284 0 4.2426 -0.8787 5.1213C19.2426 22 17.8284 22 15 22h-3c-2.82843 0 -4.24264 0 -5.12132 -0.8787C6 20.2426 6 18.8284 6 16v-5Z" stroke="currentColor" stroke-width="1.5"></path>
                        <path d="M6 19c-1.65685 0 -3 -1.3431 -3 -3v-6c0 -3.77124 0 -5.65685 1.17157 -6.82843C5.34315 2 7.22876 2 11 2h4c1.6569 0 3 1.34315 3 3" stroke="currentColor" stroke-width="1.5"></path>
                    </svg>
                </button>

                <button class="toggle-code-btn" aria-label="Toggle code visibility">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 15L12 9L6 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
        </div>
        <div class="code-block-content">
            <pre><code class="hljs language-${validLanguage}">${highlightedText}</code></pre>
        </div>
    </div>`
    );
}