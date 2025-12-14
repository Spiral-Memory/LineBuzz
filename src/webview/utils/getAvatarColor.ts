export const getAvatarColor = (name: string): string => {
    if (!name) return 'var(--vscode-button-secondaryBackground)';

    const colors = [
        '#6C539E',
        '#57629E',
        '#4387BD',
        '#3694BD',
        '#339CA8',
        '#338F87',
        '#5A945D',
        '#81A15A',
        '#7D665E',
        '#6B7D87',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash % colors.length);
    return colors[index];
};
