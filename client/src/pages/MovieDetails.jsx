import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { getLanguage } from '../utils/getLanguage.js';
import ReviewModel from '../components/ReviewModel.jsx';
import ConfirmationModel from '../components/confirmationModel.jsx';

import { Heart } from 'lucide-react';
import { toast } from 'react-toastify';

const MovieDetails = () => {
    const { id } = useParams();
    const [movieDetails, setMovieDetails] = useState(null);
    const [showReviewModel, setShowReviewModel] = useState(false);
    const [favorites, setFavorites] = useState(false);
    const [showConfirmationModel, setShowConfirmationModel] = useState(false);

    const token = localStorage.getItem('token');
    const fetchMovieDetails = () => {
        axios.get(`http://localhost:3000/api/ratings/${id}`).then(res => setMovieDetails(res.data));
    }

    const onAddFavorites = (movieId, movieTitle) => {
        if (!favorites) {
            axios.post('http://localhost:3000/api/favorites',
                { tmdb_movie_id: movieId },
                { headers: { Authorization: `Bearer ${token}` } }).then(() => {
                    setFavorites(true);
                    toast.success(`${movieTitle} is added to your favorites`);
                })
        }
        else {
            setShowConfirmationModel(true);
        }
    }

    const checkFavorites = () => {
        axios.get('http://localhost:3000/api/favorites',
            { headers: { Authorization: `Bearer ${token}` } }
        ).then(res => {
            const isFavorite = res.data.some(fav => fav.tmdb_movie_id == Number(id));
            setFavorites(isFavorite);
        })
    }

    useEffect(() => {
        fetchMovieDetails();
        checkFavorites();
    }, [id]);

    if (!movieDetails) return <div>loading...</div>;

    const getRatingColor = (rating) => {
        if (rating >= 7) return 'bg-green-600';
        if (rating >= 5) return 'bg-orange-800';
        return 'bg-red-500';
    }
    const handleSubmit = () => {
        if (!token) {
            alert("Please Login To Rate or Review");
            return;
        }
        setShowReviewModel(true);
    }
    return (
        <div className="flex flex-col gap-y-8 p-4 m-10">
            <div className="flex flex-row gap-x-10">
                {movieDetails.poster_path ? (
                    <img
                        className="w-64 h-96 object-cover rounded-lg shadow-lg"
                        src={`https://image.tmdb.org/t/p/w200${movieDetails.poster_path}`}
                        alt={movieDetails.title}
                    />
                ) : (
                    <div className="w-64 h-96 bg-gradient-to-b from-gray-700 to-gray-900 rounded-lg shadow-lg flex flex-col items-center justify-center p-6">
                        <span className="text-gray-400 text-center">{movieDetails.title}</span>
                        <span className="text-gray-500 text-sm mt-2">No poster available</span>
                    </div>
                )}
                <div className="flex flex-col">
                    <h1>{movieDetails.title}</h1>
                    <p className="text-gray-400 mt-2">Release: {movieDetails.release_date}</p>
                    <p className="text-gray-400">Runtime: {movieDetails.runtime} mins</p>
                    <p className="text-gray-400">Language: {getLanguage(movieDetails.original_language)}</p>
                    <p className="text-yellow-400 mt-4">Rating: {movieDetails.rating}/10</p>
                    <p className="text-gray-400">Total Ratings: {movieDetails.total_ratings}</p>
                    <div className="flex mt-10">
                        {!showReviewModel && (<div className="flex gap-4">
                            <button className="bg-yellow-800 px-4 py-2 rounded-sm cursor-pointer"
                                onClick={handleSubmit}>
                                Rate now
                            </button>
                            <ConfirmationModel isOpen={showConfirmationModel} onClose={() => setShowConfirmationModel(false)} movieId={id} movieTitle={movieDetails.title} onDeleted={checkFavorites} />
                            {!showConfirmationModel && <button className="flex items-center gap-2 bg-green-700 px-4 py-2 rounded-lg transition duration-300 ease-in-out text-white cursor-pointer hover:bg-green-600" onClick={() => onAddFavorites(movieDetails.id, movieDetails.title)}>
                                <Heart size={20} className={favorites ? "fill-white" : "fill-none"} />
                                <span>{favorites ? 'Dislike' : 'Like'}</span>
                            </button>}
                        </div>)}
                        <ReviewModel isOpen={showReviewModel} onClose={() => setShowReviewModel(false)}
                            movieId={id} onReviewPosted={fetchMovieDetails} />
                    </div>

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
                        <div className="flex gap-4 items-center justify-between" key={review.user_id}>
                            <div className="flex flex-col py-2 text-gray-100 text-lg" >
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

