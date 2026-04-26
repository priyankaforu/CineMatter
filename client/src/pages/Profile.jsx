import axios from 'axios';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getLanguage } from '../utils/getLanguage.js';
import { Trash2 } from 'lucide-react';
import ConfirmationModel from '../components/confirmationModel.jsx';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const token = localStorage.getItem('token');
    const [showConfirm, setShowConfirm] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const fetchFavorites = () => {
        axios.get('http://localhost:3000/api/favorites',
            {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => {
                setFavorites(res.data);
                console.log(res.data);
            });
    }

    useEffect(() => {
        fetchFavorites();
        const token = localStorage.getItem('token');
        axios.get('http://localhost:3000/api/auth/profile', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => setProfile(res.data));
    }, []);

    if (!profile && token) return <div>loading...</div>;
    if (!token) {
        return (
            <div className="flex h-screen justify-center items-center">
                <Link to="/login" className="text-2xl text-yellow-600 underline"> Please Login To Access Your Profile</Link>
            </div>
        )
    }
    return (
        <div className="flex flex-col items-center mt-10 px-6 w-full">
            <div className="w-full max-w-3xl flex flex-col gap-8">
                {/* Profile Card */}
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-yellow-700 rounded-full flex items-center justify-center text-xl font-bold">
                            {profile.user_name[0].toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-xl font-bold">{profile.user_name}</h1>
                            <p className="text-gray-400 text-sm">{profile.user_mail}</p>
                            <p className="text-yellow-500 text-sm mt-1">{getLanguage(profile.preferred_lang)}</p>
                        </div>
                    </div>
                </div>

                {/* Favorites Section */}
                <div>
                    <h2 className="text-2xl font-bold mb-6">Your Favorites</h2>
                    {favorites.length > 0 ? (
                        <div className="flex flex-col gap-4">
                            {favorites.map(fav => (
                                <div className="flex gap-4 bg-white/10 backdrop-blur-md p-4 rounded-lg" key={fav.tmdb_movie_id}>
                                    <img
                                        src={fav.poster_path
                                            ? `https://image.tmdb.org/t/p/w200${fav.poster_path}`
                                            : `https://via.placeholder.com/200x300?text=No+Poster`}
                                        alt={fav.title}
                                        className="w-28 h-40 object-cover rounded-lg shrink-0"
                                    />
                                    <div className="flex flex-col flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-bold">{fav.title}</h3>
                                                <p className="text-yellow-500 text-sm">{fav.rating} / 10</p>
                                            </div>
                                            <Trash2 size={18}
                                                className="text-gray-400 hover:text-red-500 transition cursor-pointer shrink-0"
                                                onClick={() => {
                                                    setSelectedMovie(fav);
                                                    setShowConfirm(true)
                                                }} />
                                        </div>
                                        {fav.user_review && (
                                            <div className="mt-3 bg-white/5 p-3 rounded-lg">
                                                <p className="text-sm font-bold">Rating: {fav.user_review.rating}</p>
                                                <p className="text-gray-300 text-sm mt-1 line-clamp-3">{fav.user_review.review_text}</p>
                                            </div>
                                        )}
                                        {showConfirm && selectedMovie && (
                                            <ConfirmationModel
                                                isOpen={showConfirm}
                                                onClose={() => { setShowConfirm(false); setSelectedMovie(null); }}
                                                movieId={selectedMovie.tmdb_movie_id}
                                                movieTitle={selectedMovie.title}
                                                onDeleted={() => fetchFavorites()}
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-400 text-center mt-10">No favorites yet</div>
                    )}
                </div>
            </div>
        </div>
    );

}

export default Profile;
