import axios from 'axios';
import { useState, useEffect } from 'react';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [favorites, setFavorites] = useState([]);
    useEffect(() => {
        const token = localStorage.getItem('token');
        axios.get('http://localhost:3000/api/auth/profile', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => setProfile(res.data));
        axios.get('http://localhost:3000/api/favorites',
            {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => {
                setFavorites(res.data);
                console.log(res.data[0]);
            });
    }, []);
    if (!profile) return <div>loading...</div>;
    return (
        <div className="flex flex-col p-6 text-white">
            <h1>{profile.user_name}</h1>
            <p>{profile.user_mail}</p>
        </div>
    )
}

export default Profile;
