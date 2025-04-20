import { io } from 'socket.io-client';

const socket = io("https://openplay-4o4a.onrender.com", {
  transports: ['websocket'],
  forceNew: true,
});

export default socket;
