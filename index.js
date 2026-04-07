import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import pool from './configs/db.js';
import ratingsRouter from './routes/ratings.routes.js';

dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json());
app.use('/api/ratings',ratingsRouter);
const apiKey = process.env.API_KEY;
const apiEndpoint = process.env.API_ENDPOINT;
const apiToken = process.env.API_TOKEN;

app.get('/',async (req,res) => {
    const todays_date = new Date().toISOString().slice(0,10);
    const language = req.query.language||'ta';
    const sort = req.query.sort ||'primary_release_date.desc';
    const date = req.query.date ||todays_date ;
    const page = req.query.page || 1;

    const url =`${apiEndpoint}?region=IN&release_date.lte=${date}&sort_by=${sort}&watch_region=IN&with_origin_country=IN&with_original_language=${language}&page=${page}`;
    console.log(`URL: ${url}`);
    try {
        const response = await axios.get(url, {
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${apiToken}`,
            }
        });
        const fields = ['title','release_date','id','overview','poster_path'];
        const movies = response.data.results.map((item)=>Object.fromEntries(Object.entries(item).filter(([key])=>fields.includes(key))));
        
        /* adding the pool to query the ratings and reviews */
        const enrichedMovies = await Promise.all(movies.map(async(movie)=>{
            const ratings = await pool.query('SELECT AVG(rating) as average_rating,COUNT(rating) as total_ratings,COUNT(review_text) as total_reviews FROM ratings WHERE tmdb_movie_id = $1',[movie.id]);
            return {
                ...movie,
                rating: parseFloat(ratings.rows[0].average_rating) || 0,
                total_ratings: parseFloat(ratings.rows[0].total_ratings) || 0,
                total_reviews: parseFloat(ratings.rows[0].total_reviews) || 0
            }}));

        res.status(200).json(enrichedMovies);
    } catch(error){
        console.error('Error fetching Data:', error.message);
    }
});

app.listen(PORT, ()=>{
    console.log(`Example app listening on port: ${PORT}`);
})
