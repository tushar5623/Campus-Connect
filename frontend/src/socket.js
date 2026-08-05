import { io } from 'socket.io-client';
import { Capacitor } from '@capacitor/core';

const getBackendUrl = () => {
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  
  if (Capacitor.isNativePlatform()) {
    // Production AWS server domain for native Android builds
    return 'https://api-campusconnect.me';
  }

  // Production web fallback (e.g. Vercel deployment)
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://api-campusconnect.me';
  }

  // Local development fallback
  return 'http://localhost:5000';
};

const socket = io(getBackendUrl(), {
  transports: ['websocket', 'polling'],
});

export default socket;
