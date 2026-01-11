import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

import { ClerkProvider } from '@clerk/clerk-react'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
    createRoot(document.getElementById("root")!).render(
        <div style={{ padding: '20px', fontFamily: 'system-ui', color: 'white', background: '#1a1a1a', height: '100vh' }}>
            <h1>Configuration Error</h1>
            <p>Missing <code>VITE_CLERK_PUBLISHABLE_KEY</code> in environment variables.</p>
            <p>Please check your .env.local file and restart the development server.</p>
        </div>
    );
} else {
    createRoot(document.getElementById("root")!).render(
        <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
            <App />
        </ClerkProvider>
    );
}
