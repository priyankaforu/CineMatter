import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import pool from './configs/db.js';
import ratingsRouter from './routes/ratings.routes.js';
import authRouter from './routes/auth.routes.js';
import favRouter from './routes/fav.routes.js';
import movieRouter from './routes/movies.routes.js';
import cors from 'cors';

dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/auth',authRouter);
app.use('/api/ratings',ratingsRouter);
app.use('/api/favorites',favRouter);
app.use('/api/movies',movieRouter);

app.listen(PORT, ()=>{
    console.log(`Example app listening on port: ${PORT}`);
})
