import axios from 'axios';

const fetchFriends = async () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('token');
    const res = await axios.get(`${API_URL}/api/friends/friendlist`,
        { headers: { Authorization: `Bearer ${token}` } });
    return res.data;
}

export default fetchFriends;
