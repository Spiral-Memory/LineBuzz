import { render } from 'preact';
import './styles/global.css';
import './styles/snippets.css'
import { App } from './App';
import { ErrorBoundary } from './components/ui/ErrorBoundary/ErrorBoundary';

render(
    <ErrorBoundary>
        <App />
    </ErrorBoundary>,
    document.getElementById('app')!
);