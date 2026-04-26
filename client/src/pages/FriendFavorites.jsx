import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Star, ArrowLeft } from 'lucide-react';

const FriendsFavorites = () => {
    const { state } = useLocation();
    const { friendId } = useParams();
    const navigate = useNavigate();
    const [fav, setFav] = useState([]);
    const token = localStorage.getItem('token');
    const [loading, setLoading] = useState(true);

    const friendName = state?.friendName || "Friend";
    useEffect(() => {
        axios.get(`http://localhost:3000/api/friends/favorites/${friendId}`,
            { headers: { Authorization: `Bearer ${token}` } }
        ).then(res => { setFav(res.data); setLoading(false); })
            .catch(err => { console.log(err); setLoading(false); });
    }, []);

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center gap-4 mb-8">
                <ArrowLeft className="cursor-pointer text-gray-400 hover:text-white" size={24} onClick={() => navigate(-1)} />
                <h1 className="text-2xl font-bold">{friendName}'s Favorites</h1>
            </div>
            {loading ? (
                <div className="text-gray-400 text-center mt-20">Loading...</div>
            ) :
                fav.length > 0 ? (
                    <div className="flex flex-col gap-6">
                        {fav.map(movie => (
                            <div key={movie.tmdb_movie_id} className="flex gap-4 bg-white/10 backdrop-blur-md p-4 rounded-lg">
                                <img
                                    src={movie.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : ''}
                                    alt={movie.title}
                                    className="w-28 h-40 object-cover rounded-lg"
                                />
                                <div className="flex flex-col flex-1">
                                    <h2 className="text-lg font-bold">{movie.title}</h2>
                                    <p className="text-yellow-500 text-sm">{movie.rating} / 10</p>
                                    <p className="text-gray-400 text-sm">{movie.release_date}</p>
                                    {movie.user_review && (
                                        <div className="mt-3 bg-white/5 p-3 rounded-lg">
                                            <p className="text-sm font-bold">Rating: {movie.user_review.rating}</p>
                                            <p className="text-gray-300 text-sm mt-1">{movie.user_review.review_text}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-gray-400 text-center mt-20">No Favorites Yet</div>
                )
            }
        </div>
    );
};

export default FriendsFavorites;
