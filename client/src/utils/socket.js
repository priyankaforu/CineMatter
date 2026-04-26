import { io } from 'socket.io-client';

const token = localStorage.getItem('token');
const socket = token ? io('http://localhost:3000', { auth: { token } }) : null;

export default socket;
