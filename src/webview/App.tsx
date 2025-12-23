import { h, Fragment } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { ChatView } from './views/ChatView/ChatView';
import { ConnectView } from './views/ConnectView/ConnectView';
import { vscode } from './utils/vscode';
import { useThemeDetector } from './hooks/useThemeDetector';
import { atomOneDark, atomOneLight } from './constants/highlightThemes';

interface AppState {
  isLoggedIn: boolean;
  hasTeam: boolean;
  isLoading: boolean;
}

export function App() {
  const theme = useThemeDetector();
  const [state, setState] = useState<AppState>({
    isLoggedIn: false,
    hasTeam: false,
    isLoading: true
  });

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      switch (message.command) {
        case 'updateIdentityState':
          setState({
            isLoggedIn: message.state.isLoggedIn,
            hasTeam: message.state.hasTeam,
            isLoading: false
          });
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    vscode.postMessage({ command: 'getIdentityState' });

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  if (state.isLoading) {
    return <div style={{ padding: '20px', color: 'var(--vscode-descriptionForeground)' }}>Loading...</div>;
  }

  if (!state.isLoggedIn || !state.hasTeam) {
    return <ConnectView isLoggedIn={state.isLoggedIn} hasTeam={state.hasTeam} />;
  }

  return (
    <Fragment>
      <style>{theme === 'light' ? atomOneLight : atomOneDark}</style>
      <ChatView />
    </Fragment>
  );
}