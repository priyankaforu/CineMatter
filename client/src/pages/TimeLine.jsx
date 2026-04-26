import axios from 'axios';
import { useState, useEffect } from 'react';
import { getLanguage } from '../utils/getLanguage.js';
import { toast } from 'react-toastify';
import fetchFriends from '../utils/friendList.js';

const TimeLine = () => {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [requests, setRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [showSent, setShowSent] = useState(false);
    const [friends, setFriends] = useState([]);

    const token = localStorage.getItem('token');
    let isFriend = false;
    const fetchUsers = () => {
        axios.get('http://localhost:3000/api/friends/users',
            { headers: { Authorization: `Bearer ${token}` } }).then(res => {
                setUsers(res.data)
            })
    };
    const fetchRequests = () => {
        axios.get('http://localhost:3000/api/friends/requests',
            { headers: { Authorization: `Bearer ${token}` } }).then(res => {
                setRequests(res.data)
            })
    }
    const sendRequest = (receiverId) => {
        axios.post('http://localhost:3000/api/friends/sendrequest',
            { receiver_id: receiverId },
            { headers: { Authorization: `Bearer ${token}` } }
        ).then(() => {
            toast.success('Friend request sent!');
            fetchUsers();
            waitingApproval();
        }).catch(err => {
            toast.error(err.response?.data?.message || 'Failed to send request');
        });
    };
    const waitingApproval = () => {
        axios.get('http://localhost:3000/api/friends/sent',
            { headers: { Authorization: `Bearer ${token}` } }
        ).then(res => {
            setSentRequests(res.data)
        })
    }
    const acceptRequest = (friendshipId) => {
        axios.put(`http://localhost:3000/api/friends/${friendshipId}/accept`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(() => {
            toast.success('Friend request accepted!');
            fetchRequests();
            fetchUsers();
            waitingApproval();
            fetchFriends().then(data => setFriends(data));
        }).catch(err => {
            toast.error(err.response?.data?.message || 'Failed to accept');
        });
    };

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.length > 0) {
            axios.get(`http://localhost:3000/api/friends/search?q=${query}`, {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => setSearchResults(res.data))
                .catch(() => setSearchResults([]));
        } else {
            setSearchResults([]);
        }
    };

    const deleteRequest = (deleteId, deletedName) => {
        axios.delete(`http://localhost:3000/api/friends/${deleteId}`,
            { headers: { Authorization: `Bearer ${token}` } }).then(res => {
                if (res.data.message === 'Successfully Rejected') {
                    toast.success(`${deletedName} is removed Successfully`);
                    fetchUsers();
                    fetchRequests();
                    waitingApproval();
                    fetchFriends().then(data => setFriends(data));
                } else {
                    toast.success(`${deletedName} is deleted from friends successfully`);
                    fetchUsers();
                    fetchRequests();
                    waitingApproval();

                }
            }
            )
    }

    useEffect(() => {
        fetchUsers();
        fetchRequests();
        waitingApproval();
        fetchFriends().then(data => setFriends(data));
    }, [])

    return (
        <div className="flex flex-row gap-10 mt-10 px-6 justify-center">
            <div className="flex flex-row gap-10 w-full max-w-5xl">
                {/* for people */}
                <div className={`${requests.length > 0 ? 'w-full max-w-2xl' : 'w-full max-w-4xl mx-auto'}`}>
                    <div className="w-full">
                        <div className="flex justify-between">
                            <h1 className="text-2xl font-bold mb-6">People</h1>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleSearch}
                                placeholder="Search users..."
                                className="bg-transparent border border-gray-500 rounded-lg px-4 py-2 text-white focus:border-yellow-400 focus:outline-none w-64 caret-white mb-6"
                            />
                        </div>
                        <div className="flex flex-col gap-4">
                            {(searchQuery.length > 0 ? searchResults : users).map(user => {
                                const alreadySent = sentRequests.some(sent => sent.receiver_id === user.id);
                                if (friends.length > 0) {
                                    isFriend = friends.some(friend => friend.friend_id === user.id)
                                }
                                return (
                                    <div key={user.id} className="flex justify-between items-center bg-white/10 backdrop-blur-md p-4 rounded-lg">
                                        <div className="flex flex-col">
                                            <div className="text-lg font-bold">{user.user_name}</div>
                                            <div className="text-gray-400 text-sm">{getLanguage(user.preferred_lang)} · {user.total_reviews} reviews</div>
                                        </div>
                                        {isFriend ? (
                                            <span className="text-green-400 text-sm px-4 py-2">Friends</span>
                                        ) : alreadySent ? (
                                            <span className="text-gray-400 text-sm px-4 py-2">Requested</span>
                                        ) : (
                                            <button onClick={() => sendRequest(user.id)} className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg text-white text-sm cursor-pointer">
                                                Send Request
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* for Requests*/}
                {(requests.length > 0 || sentRequests.length > 0) && (
                    <div className="w-full max-w-xl">
                        <div className="flex gap-4 mb-6">
                            <button
                                onClick={() => setShowSent(false)}
                                className={`px-4 py-2 rounded-lg text-sm cursor-pointer ${!showSent ? 'bg-yellow-700 text-white' : 'bg-white/10 text-gray-400'}`}
                            >
                                Received ({requests.length})
                            </button>
                            <button
                                onClick={() => setShowSent(true)}
                                className={`px-4 py-2 rounded-lg text-sm cursor-pointer ${showSent ? 'bg-yellow-700 text-white' : 'bg-white/10 text-gray-400'}`}
                            >
                                Sent ({sentRequests.length})
                            </button>
                        </div>
                        <div className="flex flex-col gap-4">
                            {!showSent ? (
                                requests.map(request => (
                                    <div key={request.id} className="flex justify-between items-center bg-white/10 backdrop-blur-md p-4 rounded-lg">
                                        <div className="flex flex-col">
                                            <div className="text-lg font-bold">{request.user_name}</div>
                                            <div className="text-gray-400 text-sm">{getLanguage(request.preferred_lang)}</div>
                                        </div>
                                        <div className="flex gap-4">
                                            <button className="text-sm text-gray-400 cursor-pointer" onClick={() => deleteRequest(request.id, request.user_name)}>Reject</button>
                                            <button className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg text-white text-sm cursor-pointer" onClick={() => acceptRequest(request.id)}>
                                                Accept
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                sentRequests.map(sent => (
                                    <div key={sent.id} className="flex justify-between items-center bg-white/10 backdrop-blur-md p-4 rounded-lg">
                                        <div className="flex flex-col">
                                            <div className="text-lg font-bold">{sent.user_name}</div>
                                            <div className="text-gray-400 text-sm">{getLanguage(sent.preferred_lang)}</div>
                                        </div>
                                        <button className="bg-red-800 hover:bg-red-500 px-4 py-2 rounded-lg text-white text-sm cursor-pointer" onClick={() => deleteRequest(sent.id, sent.user_name)}>
                                            Withdraw
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default TimeLine;
