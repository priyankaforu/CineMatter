const express = require('express')
const app = express()
const axios = require('axios');

require('dotenv').config();
const PORT = process.env.PORT || 3000;

const apiKey = process.env.API_KEY;
const apiEndpoint = process.env.API_ENDPOINT;
const apiToken = process.env.API_TOKEN;
const popularMovies = `${apiEndpoint}?region=IN&sort_by=popularity.desc`;

app.get('/',async (req,res) => {
    try {
        const response = await axios.get(popularMovies, {
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${apiToken}`,
            }
        });
        const data = response.data;
        res.status(200).json(data);
    } catch(error){
        console.error('Error fetching Data:', error.message);
    }
});

app.listen(PORT, ()=>{
    console.log(`Example app listening on port: ${PORT}`);
})
