import express from 'express';
import pool from '../configs/db.js';
import dotenv from 'dotenv';
import axios from 'axios';
const router = express.Router();

dotenv.config();
router.post('/',async(req,res)=>{
    const {user_id,tmdb_movie_id,review_text,rating,overwrite_ratings} = req.body;
    const existing = await pool.query(
        'SELECT * FROM ratings WHERE user_id = $1 AND tmdb_movie_id = $2',
        [user_id,tmdb_movie_id]
    );
    if(existing.rows.length>0 && !overwrite_ratings){
        return res.status(400).json({message: "You already reviewed this movie",
        existing_review: existing.rows[0]
        });
    }
    if(existing.rows.length>0 && overwrite_ratings){
        const result = await pool.query('UPDATE ratings SET review_text=$1, rating=$2, created_at=NOW() WHERE user_id = $3 AND tmdb_movie_id = $4 RETURNING *',[review_text,rating,user_id,tmdb_movie_id]);
        return res.json({message: "Review Updated",review:result.rows[0]});
    }else {
        const query = 'INSERT INTO ratings(user_id,tmdb_movie_id,review_text,rating) VALUES($1,$2,$3,$4) RETURNING *';

        try{
            const result = await pool.query(query, [user_id,tmdb_movie_id,review_text,rating]);
            res.status(201).json(result.rows[0]);
        }catch(err) {
            res.status(500).send(err.message);
        }
    }
});

router.delete('/', async(req,res)=>{
        const {user_id,tmdb_movie_id} = req.body;
        const query = 'DELETE FROM ratings where user_id=$1 AND tmdb_movie_id=$2 RETURNING *';
        const result = await pool.query(query, [user_id,tmdb_movie_id]); 
        if(result.rows.length === 0){
            return res.status(404).json({message: "No review found to delete"});
        }
        res.json({message: "Review deleted", deleted: result.rows[0]});
});

router.get('/:id',async(req,res)=>{
    try {
        const movie_id = req.params.id;
        const apiEndPoint = process.env.MOVIE_ID_ENDPOINT;
        const apiToken = process.env.API_TOKEN;
        const url = `${apiEndPoint}/${movie_id}`
        const tmdbResponse = await axios.get(url,{
            headers: {
                accept:'application/json',
                Authorization: `Bearer ${apiToken}`
            }
        });
        //Fetch movie from tmdb
        const fields = ['title','release_date','overview','poster_path','revenue','runtime','original_language','genres','status']

        const movie_data = tmdbResponse.data
        const movie = Object.fromEntries(Object.entries(movie_data).filter(([key])=>fields.includes(key)));

        const stats = await pool.query('SELECT AVG(rating) as rating, COUNT(rating) as total_ratings, COUNT(review_text) as total_reviews FROM ratings where tmdb_movie_id = $1',[movie_id]);

        const reviews = await pool.query('SELECT user_id, review_text FROM ratings WHERE tmdb_movie_id = $1',[movie_id]);

        res.json({
            ...movie,
            rating: parseFloat(stats.rows[0].rating)||0,
            total_ratings: parseFloat(stats.rows[0].total_ratings)||0,
            total_reviews: parseFloat(stats.rows[0].total_reviews)||0,
            reviews: reviews.rows
        });
    }catch(error){
        console.error('Error:',error.message);
        res.status(500).json({message: error.message});
    }
});

export default router;
