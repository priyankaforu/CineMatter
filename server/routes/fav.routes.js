import express from 'express';
import pool from '../configs/db.js';
import dotenv from 'dotenv';
import verifyToken from '../middlewares/auth.middleware.js';
import axios from 'axios';

const router = express.Router();

dotenv.config();

router.post('/', verifyToken, async (req, res) => {
    const { tmdb_movie_id } = req.body;
    const user_id = req.user.user_id;
    const query = 'INSERT INTO favorites(user_id,tmdb_movie_id) VALUES($1,$2) RETURNING *';
    const existing_query = 'SELECT * FROM favorites WHERE user_id=$1 AND tmdb_movie_id=$2';
    const existing = await pool.query(existing_query, [user_id, tmdb_movie_id]);
    if (existing.rows.length > 0) {
        return res.status(400).json({ message: "You already added this movie to your favourites", favorite_added: existing.rows[0] });
    }
    try {
        const result = await pool.query(query, [user_id, tmdb_movie_id]);
        res.status(201).json({ message: "Added movie to Favorites", favorite: result.rows[0] });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.delete('/', verifyToken, async (req, res) => {
    const { tmdb_movie_id } = req.body;
    const user_id = req.user.user_id;
    const query = 'DELETE FROM favorites WHERE user_id=$1 AND tmdb_movie_id=$2 RETURNING *';
    const result = await pool.query(query, [user_id, tmdb_movie_id]);
    if (result.rows.length === 0) {
        return res.status(404).json({ message: "This is not in your favorite list" });
    }
    res.status(200).json({ message: "Favorite deleted", deleted: result.rows[0] });
});

router.get('/', verifyToken, async (req, res) => {
    const user_id = req.user.user_id;
    const apiEndPoint = process.env.MOVIE_ID_ENDPOINT;
    const apiToken = process.env.API_TOKEN;
    const query = 'SELECT tmdb_movie_id from favorites WHERE user_id=$1';
    //Fetch movie from tmdb
    const fields = ['title', 'release_date', 'poster_path']

    const result = await pool.query(query, [user_id]);
    const movies = result.rows;
    console.log(movies);
    const favMovies = await Promise.all(movies.map(async (movie) => {
        const ratings = await pool.query(
            'SELECT AVG(rating) as average_rating, COUNT(rating) as total_ratings, COUNT(review_text) as total_reviews FROM ratings WHERE tmdb_movie_id = $1',
            [movie.tmdb_movie_id]
        );
        const userReview = await pool.query('SELECT review_text,rating FROM ratings WHERE user_id = $1 AND tmdb_movie_id= $2', [user_id, movie.tmdb_movie_id]);
        const url = `${apiEndPoint}/${movie.tmdb_movie_id}`
        const tmdbResponse = await axios.get(url, {
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${apiToken}`
            }
        });
        const movie_data = tmdbResponse.data
        const movieData = Object.fromEntries(Object.entries(movie_data).filter(([key]) => fields.includes(key)));
        return {
            ...movieData,
            tmdb_movie_id: movie.tmdb_movie_id,
            rating: parseFloat(ratings.rows[0].average_rating) || 0,
            total_ratings: parseInt(ratings.rows[0].total_ratings) || 0,
            total_reviews: parseInt(ratings.rows[0].total_reviews) || 0,
            user_review: userReview.rows[0] || null
        };
    }));

    res.json(favMovies);
});

export default router;
