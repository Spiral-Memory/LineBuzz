import { Component, ComponentChildren } from 'preact';
import { vscode } from '../../../utils/vscode';
import styles from './ErrorBoundary.module.css';

interface Props {
    children: ComponentChildren;
}

interface State {
    hasError: boolean;
    error: Error | null;
    feedback: string;
    hasReported: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null, feedback: '', hasReported: false };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    handleFeedbackChange = (e: any) => {
        this.setState({ feedback: e.target.value });
    }

    handleReport = () => {
        const baseUrl = 'https://github.com/Spiral-Memory/linebuzz/issues/new';
        const title = encodeURIComponent(`Bug Report: ${this.state.error?.message || 'Unexpected Error'}`);
        const body = encodeURIComponent(this.state.feedback);
        const finalUrl = `${baseUrl}?title=${title}&body=${body}`;
        vscode.postMessage({
            command: 'openExternal',
            url: finalUrl
        });
        this.setState({ hasReported: true });
    }

    handleReload = () => {
        this.setState({ hasError: false, error: null, feedback: '', hasReported: false });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div class={styles['error-container']}>
                    <h2 class={styles['error-title']}>Something went wrong</h2>
                    <p class={styles['error-message']}>{this.state.error?.message}</p>

                    <div class={styles['feedback-section']}>
                        <label class={styles['feedback-label']}>Tell us what happened:</label>
                        <textarea
                            class={styles['feedback-input']}
                            value={this.state.feedback}
                            onInput={this.handleFeedbackChange}
                            placeholder="I was trying to..."
                        />
                    </div>

                    <div class={styles['actions']}>
                        {!this.state.hasReported ? (
                            <button class={`${styles['btn']} ${styles['btn-secondary']}`} onClick={this.handleReport}>
                                Report Issue
                            </button>
                        ) : (
                            <p class={styles['thank-you-message']}>Thanks for reporting, we will look into it.</p>
                        )}
                        <button class={`${styles['btn']} ${styles['btn-primary']}`} onClick={this.handleReload}>
                            Reload
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
