import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { getLanguage } from '../utils/getLanguage.js';

const MovieDetails = () => {
    const { id } = useParams();
    const [movieDetails, setMovieDetails] = useState(null);

    useEffect(() => {
        axios.get(`http://localhost:3000/api/ratings/${id}`).then(res => setMovieDetails(res.data));
    }, [id]);

    if (!movieDetails) return <div>loading...</div>;

    const getRatingColor = (rating) => {
        if (rating >= 7) return 'bg-green-600';
        if (rating >= 5) return 'bg-yellow-400';
        return 'bg-red-500';
    }

    return (
        <div className="flex flex-col gap-y-8 p-4 m-10">
            <div className="flex flex-row gap-x-10">
                <div className="flex">
                    {movieDetails.poster_path && (<img src={movieDetails.poster_path
                        ? `https://image.tmdb.org/t/p/w200${movieDetails.poster_path}`
                        : `https://via.placeholder.com/200x300?text=No+Poster`}
                        alt={movieDetails.poster_path}
                        className="rounded-lg w-64 shrink-0"
                    />)}
                </div>
                <div className="flex flex-col">
                    <h1>{movieDetails.title}</h1>
                    <p className="text-gray-400 mt-2">Release: {movieDetails.release_date}</p>
                    <p className="text-gray-400">Runtime: {movieDetails.runtime} mins</p>
                    <p className="text-gray-400">Language: {getLanguage(movieDetails.original_language)}</p>
                    <p className="text-yellow-400 mt-4">Rating: {movieDetails.rating}/10</p>
                    <p className="text-gray-400">Total Ratings: {movieDetails.total_ratings}</p>
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <div className="flex gap-4">
                    {movieDetails.genres.map(genre => (
                        <span key={genre.id} className="bg-gray-800 px-2 py-1 rounded-sm">
                            {genre.name}
                        </span>
                    ))}
                </div>
                <p className="mt-4">{movieDetails.overview}</p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
                <div className="flex gap-2 items-center">
                    <div className="text-3xl font-bold text-white mb-2">Reviews</div>
                    <div className="bg-yellow-800 px-2 py-0.5font-bold rounded-sm">
                        {movieDetails.total_reviews}
                    </div>
                </div>
                <div className="flex flex-col gap-2 divide-y divide-gray-200">
                    {movieDetails.reviews.map(review => (
                        <div className="flex gap-4 items-center justify-between">
                            <div className="flex flex-col py-2 text-gray-100 text-lg" key={review.user_id}>
                                {review.review_text}
                            </div>
                            <div className={`${getRatingColor(review.rating)} flex text-gray-100 px-3 py-0.5 rounded-sm`} key={review.user_id}>
                                {review.rating} / 10
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default MovieDetails;

