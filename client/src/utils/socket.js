import { io } from 'socket.io-client';
const API_URL = import.meta.env.VITE_API_URL;
const token = localStorage.getItem('token');
const socket = token ? io(`${API_URL}`, { auth: { token } }) : null;

export default socket;
