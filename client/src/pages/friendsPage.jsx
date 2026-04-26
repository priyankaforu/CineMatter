import fetchFriends from '../utils/friendList.js';
import { useState, useEffect } from 'react';
import { ChevronRight, Trash2 } from 'lucide-react';
import { getLanguage } from '../utils/getLanguage.js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import ConfirmationModel from '../components/confirmationModel.jsx';

const FriendsPage = () => {
    const token = localStorage.getItem('token');
    const [friends, setFriends] = useState([]);
    const [showConfirm, setShowConfirm] = useState(false);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const navigate = useNavigate();

    const deleteFriend = (deleteId, deletedName) => {
        axios.delete(`http://localhost:3000/api/friends/unfriend/${deleteId}`,
            { headers: { Authorization: `Bearer ${token}` } }).then(res => {
                toast.success(`${deletedName} removed from friends`);
                fetchFriends().then(data => setFriends(data));
                setShowConfirm(false);
                setSelectedFriend(null);
            })
    }

    useEffect(() => {
        fetchFriends().then(data => setFriends(data));
    }, [])

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
                            <div className="flex items-center gap-4">
                                <Trash2 size={18} className="text-gray-400 hover:text-red-500 transition"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedFriend(friend);
                                        setShowConfirm(true);
                                    }} />
                                <ChevronRight className="text-gray-400" size={20} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-gray-400 text-center mt-20">No friends yet</div>
            )}

            {showConfirm && selectedFriend && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-[#1a1a2e] p-6 rounded-lg max-w-sm w-full mx-4">
                        <p className="text-lg mb-6">Remove <span className="font-bold text-yellow-600">{selectedFriend.user_name}</span> from friends?</p>
                        <div className="flex justify-end gap-4">
                            <button onClick={() => { setShowConfirm(false); setSelectedFriend(null); }}
                                className="px-4 py-2 text-gray-400 hover:text-white text-sm cursor-pointer">Cancel</button>
                            <button onClick={() => deleteFriend(selectedFriend.friend_id, selectedFriend.user_name)}
                                className="bg-red-900 hover:bg-red-600 px-4 py-2 rounded-lg text-white text-sm cursor-pointer">Remove</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FriendsPage;
