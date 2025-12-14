export const formatTime = (dateString: string) => {
    try {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } catch (e) {
        return '';
    }
};