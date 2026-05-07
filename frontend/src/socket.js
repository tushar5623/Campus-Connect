import { io } from 'socket.io-client';

const socket = io('https://api-campusconnect.me');

export default socket;  