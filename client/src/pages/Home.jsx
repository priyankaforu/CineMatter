import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

const Home = ()=> {

    const[movies, setMovies] = useState([]);

        useEffect(()=>{
            axios.get('http://localhost:3000/api/movies').then(res=>setMovies(res.data));
        },[]);

        return(
            <div className="movie-grid">
                {movies.map(movie=>(
                    <div className="movie-card" key={movie.id}>
                    {movie.poster_path && (<img
                            src={movie.poster_path 
                                ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
                                : `https://via.placeholder.com/200x300?text=No+Poster`}
                            className="movie-poster"
                            alt = {movie.title}
                         />
                    )}
                        <h3 className="movie-title">{movie.title}</h3>
                    </div>
                ))}
            </div>
        );
}

export default Home 

