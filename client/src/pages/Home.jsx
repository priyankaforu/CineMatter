import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Home = () => {

    const [movies, setMovies] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:3000/api/movies').then(res => setMovies(res.data));
    }, []);

    return (
        <div className="movie-grid">
            {movies.map(movie => (
                <Link to={`/movie/${movie.id}`} key={movie.id}>
                    <div className="movie-card">
                        {movie.poster_path && (<img
                            src={movie.poster_path
                                ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
                                : `https://via.placeholder.com/200x300?text=No+Poster`}
                            alt={movie.title}
                        />
                        )}
                        <h3 className="movie-title">{movie.title}</h3>
                    </div>
                </Link>
            ))}
        </div>
    );
}

export default Home

