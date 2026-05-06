import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './ThemeContext.jsx'

// 1. Google Auth plugin ko import karo
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

// 2. React app render hone se pehle isko initialize karo
GoogleAuth.initialize({
  clientId: '640908739685-gpadvce0rn61vbjgfqbdh646ng0al4l2.apps.googleusercontent.com',
  scopes: ['profile', 'email'],
  grantOfflineAccess: true,
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)