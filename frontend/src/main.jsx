import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import './index.css';
import App from './App.jsx';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const Tree = PUBLISHABLE_KEY ? (
  <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
    <App />
  </ClerkProvider>
) : (
  <App />
);

if (!PUBLISHABLE_KEY && import.meta.env.DEV) {
  console.warn(
    '[Hiriya] VITE_CLERK_PUBLISHABLE_KEY is not set. Running without auth (guest mode only).',
  );
}

createRoot(document.getElementById('root')).render(<StrictMode>{Tree}</StrictMode>);
