import { io } from 'socket.io-client';

// Backend ka URL yahan denge
const socket = io('http://13.126.87.252:5000');

export default socket;  