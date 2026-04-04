import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
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

    const url =`${apiEndpoint}?region=IN&release_date.lte=${date}&sort_by=${sort}&watch_region=IN&with_origin_country=IN&with_original_language=${language}`;
    console.log(`URL: ${url}`);
    try {
        const response = await axios.get(url, {
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${apiToken}`,
            }
        });
        const fields = ['title','release_date','overview','id','overview'];
        const data = response.data.results.map((item)=>Object.fromEntries(Object.entries(item).filter(([key])=>fields.includes(key))));
        res.status(200).json(data);
    } catch(error){
        console.error('Error fetching Data:', error.message);
    }
});

app.listen(PORT, ()=>{
    console.log(`Example app listening on port: ${PORT}`);
})
