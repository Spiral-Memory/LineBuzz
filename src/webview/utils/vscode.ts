export const vscode = (function () {
    try {
        if ((window as any).acquireVsCodeApi) {
            return (window as any).acquireVsCodeApi();
        }
    } catch (e) {
        console.warn('Failed to acquire VS Code API:', e);
    }

    // Fallback or mock for development outside VS Code if needed
    return {
        postMessage: (message: any) => {
            console.log('Mock postMessage:', message);
        },
        getState: () => ({}),
        setState: () => { }
    };
})();
