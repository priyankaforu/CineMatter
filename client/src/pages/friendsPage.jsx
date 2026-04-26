import fetchFriends from '../utils/friendList.js';
import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { getLanguage } from '../utils/getLanguage.js';
import { useNavigate } from 'react-router-dom';

const FriendsPage = () => {
    const [friends, setFriends] = useState([]);

    useEffect(() => {
        fetchFriends().then(data => setFriends(data));
    }, [])
    const navigate = useNavigate();
    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Friends</h1>
            {friends.length > 0 ? (
                <div className="flex flex-col gap-4">
                    {friends.map(friend => (
                        <div key={friend.friend_id}
                            onClick={() => navigate(`/friends/${friend.friend_id}/favorites`, { state: { friendName: friend.user_name } })}
                            className="flex justify-between items-center bg-white/10 backdrop-blur-md p-4 rounded-lg cursor-pointer hover:bg-white/20 transition">
                            <div>
                                <div className="text-lg font-bold">{friend.user_name}</div>
                                <div className="text-gray-400 text-sm">{getLanguage(friend.preferred_lang)}</div>
                            </div>
                            <ChevronRight className="text-gray-400" size={20} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-gray-400 text-center mt-20">No friends yet</div>
            )}
        </div>
    );
}

export default FriendsPage;
