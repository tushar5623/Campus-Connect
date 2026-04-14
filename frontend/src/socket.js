import { io } from 'socket.io-client';

// Backend ka URL yahan denge
const socket = io('http://localhost:5000');

export default socket;