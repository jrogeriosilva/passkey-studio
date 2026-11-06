import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './features/inspector/index.css';
import './features/lab/index.css';
import './features/learn/index.css';
import './index.css';
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
