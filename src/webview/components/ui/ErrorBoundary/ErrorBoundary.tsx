import { Component, ComponentChildren } from 'preact';
import styles from './ErrorBoundary.module.css';

interface Props {
    children: ComponentChildren;
}

interface State {
    hasError: boolean;
    error: Error | null;
    feedback: string;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null, feedback: '' };
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
        const { error, feedback } = this.state;
        const subject = encodeURIComponent("LineBuzz Error Report");
        const body = encodeURIComponent(
            `User Feedback:\n${feedback}\n\nError Message:\n${error?.message}\n\nStack Trace:\n${error?.stack}`
        );

        window.open(`mailto:zishan.barun@gmail.com?subject=${subject}&body=${body}`);
    }

    handleReload = () => {
        window.location.reload();
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
                        <button class={`${styles['btn']} ${styles['btn-secondary']}`} onClick={this.handleReport}>
                            Report Issue
                        </button>
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
