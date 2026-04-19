import { useState } from 'react';
import axios from 'axios';

const ReviewModel = ({ isOpen, onClose, movieId, onReviewPosted }) => {
    const [rating, setRating] = useState('');
    const [review, setReview] = useState('');

    if (!isOpen) return null;
    const token = localStorage.getItem('token');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3000/api/ratings',
                { tmdb_movie_id: movieId, review_text: review, rating: Number(rating) },
                { headers: { Authorization: `Bearer ${token}` } });
            onReviewPosted();
            onClose();
        } catch (err) {
            const overwrite = window.confirm(`You have already rated or reviewed for the movie, do you want to overwrite ?`);
            if (err.response?.status === 400) {
                await axios.post('http://localhost:3000/api/ratings',
                    { tmdb_movie_id: movieId, review_text: review, rating: rating, overwrite_ratings: overwrite },
                    { headers: { Authorization: `Bearer ${token}` } });
                onReviewPosted();
                onClose();
            }
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
                <h2 className="text-white text-xl mb-4">Rate this movie</h2>
                <input
                    type="number"
                    min="1"
                    max="10"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    placeholder="Rating /10"
                    className="w-full p-3 mb-4 rounded bg-transparent border border-gray-500 text-white"
                />
                <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="How is the movie..."
                    className="w-full p-3 mb-4 rounded bg-transparent border border-gray-500 text-white h-32"
                />
                <div className="flex gap-4 justify-end">
                    <button onClick={onClose} className="text-gray-400 cursor-pointer">Cancel</button>
                    <button onClick={handleSubmit} className="bg-yellow-700 px-4 py-2 rounded text-white cursor-pointer">Post</button>
                </div>
            </div>
        </div>
    );
}

export default ReviewModel;
