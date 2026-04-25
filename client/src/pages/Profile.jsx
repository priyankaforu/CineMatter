import axios from 'axios';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const token = localStorage.getItem('token');
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

    const handleDelete = (movieId) => {

        axios.delete("http://localhost:3000/api/favorites", {
            headers: { Authorization: `Bearer ${token}` },
            data: { tmdb_movie_id: movieId }
        }).then(() => fetchFavorites());
    };
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
            <div className="w-full max-w-2xl flex flex-col gap-10">
                <div className="flex flex-col pb-6 text-white">
                    <h1>{profile.user_name}</h1>
                    <p>{profile.user_mail}</p>
                </div>
                <div className="flex flex-col gap-8">
                    <div className="font-bold text-2xl">Your Favorites</div>
                    <div className="flex flex-col gap-10">
                        {favorites.map(fav => (
                            <div className="flex flex-row gap-x-6" key={fav.tmdb_movie_id}>
                                <div className="flex">
                                    {fav.poster_path && (<img src={fav.poster_path
                                        ? `https://image.tmdb.org/t/p/w200${fav.poster_path}`
                                        : `https://via.placeholder.com/200x300?text=No+Poster`}
                                        alt={fav.poster_path}
                                        className="rounded-lg w-36 shrink-0"
                                    />)}
                                </div>
                                <div className="flex flex-col gap-">
                                    <div className="flex justify-between">
                                        <div className="font-bold text-lg">{fav.title}</div>
                                        <button className="cursor-pointer" onClick={() => handleDelete(fav.tmdb_movie_id)}>Delete</button>
                                    </div>
                                    <div className="text-yellow-400">{fav.rating} / 10</div>
                                    <div className="font-bold mt-2">Your Review</div>
                                    {fav.user_review && (<div className="mt-2 rounded-lg w-100 bg-white/10 backdrop-blur-md p-4">
                                        <div className="p-1">
                                            <div className="flex flex-row items-start gap-2">
                                                <span>Rating : </span>
                                                <span className="text-lg">{fav.user_review.rating}</span>
                                            </div>
                                            <div className="line-clamp-3">{fav.user_review.review_text}</div>
                                        </div>
                                    </div>)}
                                </div>
                            </div>
                        ))
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile;
