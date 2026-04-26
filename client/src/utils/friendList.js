import axios from 'axios';

const fetchFriends = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get('http://localhost:3000/api/friends/friendlist',
        { headers: { Authorization: `Bearer ${token}` } });
    return res.data;
}

export default fetchFriends;
