import express from 'express';
import pool from '../configs/db.js';
const router = express.Router();

router.post('/',async(req,res)=>{
    const {user_id,tmdb_movie_id,review_text,rating} = req.body;
    const query = 'INSERT INTO ratings(user_id,tmdb_movie_id,review_text,rating) VALUES($1,$2,$3,$4) RETURNING *';

    try{
        const result = await pool.query(query, [user_id,tmdb_movie_id,review_text,rating]);
        res.json(result.rows[0]);
    }catch(err) {
        res.status(500).send(err.message);
    }
});

export default router;
