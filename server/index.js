import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import pool from './configs/db.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import ratingsRouter from './routes/ratings.routes.js';
import authRouter from './routes/auth.routes.js';
import favRouter from './routes/fav.routes.js';
import movieRouter from './routes/movies.routes.js';
import forgotRouter from './routes/password.routes.js';
import friendsRouter from './routes/friends.routes.js';
import jwt from 'jsonwebtoken';

import cors from 'cors';

dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();
const server = createServer(app);
const onlineUsers = new Map();
const CLIENT_URL = process.env.CLIENT_URL;

const allowedOrigins = ['https://cinematter.site', 'https://cinematter.pages.dev'];
const io = new Server(server, {
    cors: { origin: allowedOrigins }
});

{/* if cors then { cors :{origin: 'http...' }*/ }

app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
    req.io = io;
    req.onlineUsers = onlineUsers;
    next();
});

app.use('/api/auth', authRouter);
app.use('/api/ratings', ratingsRouter);
app.use('/api/favorites', favRouter);
app.use('/api/movies', movieRouter);
app.use('/api/password', forgotRouter);
app.use('/api/friends', friendsRouter);

io.on('connection', (socket) => {
    const token = socket.handshake.auth.token;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            const userId = decoded.user_id;
            onlineUsers.set(userId, socket.id);
            console.log(`User ${userId} is connected with ${socket.id}`);
        } catch (err) {
            console.error(`Token is invalid`);
        }
    }

    console.log('a user connected');
    socket.on('disconnect', () => {
        // remove from onlineUsers
        for (const [userId, socketId] of onlineUsers) {
            if (socketId === socket.id) {
                onlineUsers.delete(userId);
                console.log(`User ${userId} is disconnected`);
                break;
            }
        }
    });
});


server.listen(PORT, () => {
    console.log(`Example app listening on port: ${PORT}`);
})
