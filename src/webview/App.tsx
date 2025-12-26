import { Fragment } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { ChatView } from './views/ChatView/ChatView';
import { ConnectView } from './views/ConnectView/ConnectView';
import { vscode } from './utils/vscode';
import { useThemeDetector } from './hooks/useThemeDetector';
import { atomOneDark, atomOneLight } from './constants/highlightThemes';
import { Snippet } from '../shared/interfaces/ISnippet';
import { LoadingBar } from './components/ui/Loaders/LoadingBar';

interface AppState {
  isLoggedIn: boolean;
  hasTeam: boolean;
  isLoading: boolean;
  stagedSnippet?: Snippet[] | [];
}

export function App() {
  const theme = useThemeDetector();
  const [state, setState] = useState<AppState>({
    isLoggedIn: false,
    hasTeam: false,
    isLoading: true,
    stagedSnippet: []
  });

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      switch (message.command) {
        case 'updateIdentityState':
          setState(prev => ({
            ...prev,
            isLoggedIn: message.state.isLoggedIn,
            hasTeam: message.state.hasTeam,
            isLoading: false
          }));
          break;
        case 'updateSnippet':
          setState(prev => ({
            ...prev,
            stagedSnippet: message.snippet
          }));
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    vscode.postMessage({ command: 'getWebviewState' });

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleRemoveSnippet = (index: number) => {
    vscode.postMessage({
      command: 'removeSnippet',
      index
    });
  };

  const handleClearSnippet = () => {
    vscode.postMessage({
      command: 'clearSnippet'
    });
  };

  const handleOpenSnippet = (snippet: Snippet) => {
    vscode.postMessage({
      command: 'openSnippet',
      snippet
    });
  };

  if (state.isLoading) {
    return <LoadingBar />;
  }

  if (!state.isLoggedIn || !state.hasTeam) {
    return <ConnectView isLoggedIn={state.isLoggedIn} hasTeam={state.hasTeam} />;
  }

  return (
    <Fragment>
      <style>{theme === 'light' ? atomOneLight : atomOneDark}</style>
      <ChatView
        stagedSnippet={state.stagedSnippet}
        onClearSnippet={handleClearSnippet}
        onRemoveSnippet={handleRemoveSnippet}
        onOpenSnippet={handleOpenSnippet}
      />
    </Fragment>
  );
}