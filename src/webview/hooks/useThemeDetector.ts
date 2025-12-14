import { useState, useEffect } from 'preact/hooks';

type Theme = 'light' | 'dark';

export const useThemeDetector = (): Theme => {
    const [theme, setTheme] = useState<Theme>('dark');

    useEffect(() => {
        const updateTheme = () => {
            const body = document.body;
            if (body.classList.contains('vscode-light') ||
                body.classList.contains('vscode-high-contrast-light')) {
                setTheme('light');
            } else {
                setTheme('dark');
            }
        };

        updateTheme();

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    updateTheme();
                }
            });
        });

        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, []);

    return theme;
};
