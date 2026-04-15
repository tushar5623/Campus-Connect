import { io } from 'socket.io-client';

// Backend ka URL yahan denge
const socket = io('https://api-campusconnect.me');

export default socket;  