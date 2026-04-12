import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import {enrichMovies} from '../helpers/enrichedMovies.js';

const router = express.Router();

dotenv.config();
const apiKey = process.env.API_KEY;
const apiEndpoint = process.env.API_ENDPOINT;
const apiToken = process.env.API_TOKEN;

router.get('/',async (req,res) => {
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
                Authorization: `Bearer ${apiToken}`
            }
        });
    const enrichedMovies = await enrichMovies(response.data.results);
    return res.json(enrichedMovies);
    } catch(error){
        console.error('Error fetching Data:', error.message);
    }
});


router.get('/search', async(req,res)=>{
    const movie_name = req.query.q;
    const apiToken = process.env.API_TOKEN;
    const url = `https://api.themoviedb.org/3/search/movie?query=${movie_name}`;

    const tmdbResponse = await axios.get(url,{
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${apiToken}`
        }
    });
    const enrichedMovies = await enrichMovies(tmdbResponse.data.results);
    return res.json(enrichedMovies);
});

export default router;
