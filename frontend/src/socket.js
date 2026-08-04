import { io } from 'socket.io-client';
import { Capacitor } from '@capacitor/core';

const getBackendUrl = () => {
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  
  if (Capacitor.isNativePlatform()) {
    // Android Emulator host loopback address is 10.0.2.2
    return 'http://10.0.2.2:5000';
  }

  return 'http://localhost:5000';
};

const socket = io(getBackendUrl(), {
  transports: ['websocket', 'polling'],
});

export default socket;
