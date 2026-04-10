import express from 'express';
import pool from '../configs/db.js';
import dotenv from 'dotenv';
import verifyToken from '../middlewares/auth.middleware.js';

const router = express.Router();

dotenv.config();

router.post('/', verifyToken, async(req,res)=>{
    const {tmdb_movie_id} = req.body;
    const user_id = req.user.user_id;
    const query = 'INSERT INTO favorites(user_id,tmdb_movie_id) VALUES($1,$2) RETURNING *';
    const existing_query = 'SELECT * FROM favorites WHERE user_id=$1 AND tmdb_movie_id=$2';
    const existing = await pool.query(existing_query,[user_id,tmdb_movie_id]);
    if(existing.rows.length>0){
        return res.status(400).json({message: "You already added this movie to your favourites", favorite_added: existing.rows[0]});
    }
    try {
        const result = await pool.query(query,[user_id,tmdb_movie_id]);
        res.status(201).json({message: "Added movie to Favorites", favorite: result.rows[0]});
    }catch(err){
        res.status(500).send(err.message);
    }
});

router.delete('/',verifyToken, async(req,res)=>{
    const {tmdb_movie_id} = req.body;
    const user_id = req.user.user_id;
    const query = 'DELETE FROM favorites WHERE user_id=$1 AND tmdb_movie_id=$2 RETURNING *';
    const result = await pool.query(query,[user_id,tmdb_movie_id]);
    if(result.rows.length===0){
        return res.status(404).json({message: "This is not in your favorite list"});
    }
    res.status(200).json({message: "Review deleted", deleted: result.rows[0]});
});

router.get('/', verifyToken, async(req,res)=>{
    const user_id = req.user.user_id;
    const query = 'SELECT tmdb_movie_id from favorites WHERE user_id=$1';
    const result = await pool.query(query, [user_id]);
    res.json(result.rows);
});

export default router;
