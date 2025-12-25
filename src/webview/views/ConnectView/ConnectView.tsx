import { vscode } from '../../utils/vscode';
import { WelcomeSplash } from '../../components/chat/WelcomeSplash/WelcomeSplash';
import styles from './ConnectView.module.css';

interface ConnectViewProps {
    isLoggedIn: boolean;
    hasTeam: boolean;
}

export const ConnectView = ({ isLoggedIn, hasTeam }: ConnectViewProps) => {

    const handleSignIn = () => {
        vscode.postMessage({ command: 'signIn' });
    };

    const handleCreateTeam = () => {
        vscode.postMessage({ command: 'createTeam' });
    };

    const handleJoinTeam = () => {
        vscode.postMessage({ command: 'joinTeam' });
    };

    return (
        <div class={styles['connect-view-container']}>
            <WelcomeSplash />
            <div class={styles['action-section']}>
                {!isLoggedIn ? (
                    <button
                        class={`${styles['connect-btn']} ${styles['primary']}`}
                        onClick={handleSignIn}
                    >
                        Sign in with GitHub
                    </button>
                ) : !hasTeam ? (
                    <>
                        <button class={`${styles['connect-btn']} ${styles['primary']}`} onClick={handleCreateTeam}>
                            Create New Team
                        </button>
                        <button class={`${styles['connect-btn']} ${styles['secondary']}`} onClick={handleJoinTeam}>
                            Join Existing Team
                        </button>
                    </>
                ) : (
                    <div class={styles['success-message']}>
                        <p>You are all set!</p>
                    </div>
                )}
            </div>
        </div>
    );
};
