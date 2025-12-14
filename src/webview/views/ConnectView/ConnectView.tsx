import { h, Fragment } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { vscode } from '../../utils/vscode';
import './ConnectView.css';

interface ConnectViewProps {
    isLoggedIn: boolean;
    hasTeam: boolean;
}

export const ConnectView = ({ isLoggedIn, hasTeam }: ConnectViewProps) => {
    const [loading, setLoading] = useState(false);

    const handleSignIn = () => {
        setLoading(true);
        vscode.postMessage({ command: 'signIn' });
    };

    const handleCreateTeam = () => {
        vscode.postMessage({ command: 'createTeam' });
    };

    const handleJoinTeam = () => {
        vscode.postMessage({ command: 'joinTeam' });
    };

    return (
        <div class="connect-view-container">
            <div class="intro-section">
                <h1 class="title">LineBuzz</h1>
                <p class="subtitle">Real-time collaboration for your codebase.</p>
            </div>

            <div class="status-indicator">
                <span class={`status-dot ${isLoggedIn ? 'active' : ''}`}></span>
                <span>{isLoggedIn ? 'Authenticated' : 'Not Connected'}</span>
            </div>

            <div class="action-section">
                {!isLoggedIn ? (
                    <button
                        class="connect-btn primary"
                        onClick={handleSignIn}
                        disabled={loading}
                    >
                        {loading ? 'Connecting...' : 'Sign in with GitHub'}
                    </button>
                ) : !hasTeam ? (
                    <>
                        <button class="connect-btn primary" onClick={handleCreateTeam}>
                            Create New Team
                        </button>
                        <button class="connect-btn secondary" onClick={handleJoinTeam}>
                            Join Existing Team
                        </button>
                    </>
                ) : (
                    <div class="success-message">
                        <p>You are all set!</p>
                    </div>
                )}
            </div>
        </div>
    );
};
