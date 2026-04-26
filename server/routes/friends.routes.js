import express from 'express';
import pool from '../configs/db.js';
import verifyToken from '../middlewares/auth.middleware.js';
import dotenv from 'dotenv';
import axios from 'axios';

const router = express.Router();
dotenv.config();

router.post('/sendrequest', verifyToken, async (req, res) => {
    const { receiver_id } = req.body;
    const sender_id = req.user.user_id;
    const receiver_data = 'SELECT user_name FROM users WHERE id=$1';
    const checkReceiverData = await pool.query(receiver_data, [receiver_id]);

    //check duplicates
    const existing = await pool.query(
        'SELECT * FROM friends WHERE sender_id=$1 AND receiver_id=$2',
        [sender_id, receiver_id]
    );
    if (existing.rows.length > 0) {
        return res.status(400).json({ message: "Friend request already sent" });
    }

    if (checkReceiverData.rows.length === 0) {
        return res.status(404).json({ message: "The receiver doesn't exist" });
    }
    const senderData = await pool.query('SELECT user_name FROM users WHERE id=$1', [sender_id]);
    const senderName = senderData.rows[0].user_name;

    const sendRequest = await pool.query('INSERT INTO friends(sender_id,receiver_id,status) VALUES($1,$2,$3) RETURNING *', [sender_id, receiver_id, 'pending']);

    //socket event (emits)
    const receiverSocketId = req.onlineUsers.get(parseInt(receiver_id));
    if (receiverSocketId) {
        req.io.to(receiverSocketId).emit('friend-request', {
            message: `${senderName} sent you a friend request`
        });
    }
    res.status(200).json(sendRequest.rows[0]);
});

router.put('/:id/accept', verifyToken, async (req, res) => {
    const friend_id = req.params.id;
    const receiver_id = req.user.user_id;
    const checkStatus = await pool.query('SELECT * FROM friends WHERE id=$1 AND receiver_id=$2', [friend_id, receiver_id]);
    if (checkStatus.rows.length === 0) {
        return res.status(404).json({ message: "Friend request not found" });
    }
    if (checkStatus.rows[0].status === 'accepted') {
        return res.status(400).json({ message: "Friend Request Already Accepted" });
    }
    const sender_id = checkStatus.rows[0].sender_id;
    const sender = await pool.query('SELECT user_name FROM users where id=$1', [checkStatus.rows[0].sender_id]);

    //find the receiver name 
    const receiverData = await pool.query('SELECT user_name FROM users WHERE id=$1', [receiver_id]);
    const receiverName = receiverData.rows[0].user_name;

    try {
        const updateStatus = await pool.query('UPDATE friends SET status=$1 WHERE id=$2 RETURNING *', ['accepted', friend_id]);

        const senderSocketId = req.onlineUsers.get(parseInt(sender_id));
        {/* console.log('Sender socket:', senderSocketId);*/ }
        if (senderSocketId) {
            req.io.to(senderSocketId).emit('request-accepted', {
                message: `${receiverName} accepted your friend request`
            });
        }


        // Delete any reverse pending request
        await pool.query('DELETE FROM friends WHERE sender_id=$1 AND receiver_id=$2', [receiver_id, sender_id]);
        return res.status(200).json({ message: `Friend request is accepted from ${sender.rows[0].user_name}`, updated: updateStatus.rows[0] });
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
});

router.get('/requests', verifyToken, async (req, res) => {
    const receiver_id = req.user.user_id;
    const requestedUsers = await pool.query('SELECT f.id,f.sender_id,f.created_at, u.user_name, u.preferred_lang FROM friends f JOIN users u ON f.sender_id=u.id WHERE receiver_id=$1 AND status=$2', [receiver_id, 'pending']);
    if (requestedUsers.rows.length === 0) {
        return res.status(200).json([]);
    }
    res.status(200).json(requestedUsers.rows);
});

//Implementing the search query

router.get('/search', verifyToken, async (req, res) => {
    const friend_name = req.query.q;
    const user_id = req.user.user_id;
    const friendsList = await pool.query(
        'SELECT id, user_name, preferred_lang FROM users WHERE user_name ILIKE $1 AND id != $2',
        [`%${friend_name}%`, user_id]
    );
    if (friendsList.rows.length === 0) {
        return res.status(404).json({ message: `No Users Exist As ${friend_name}` });
    }
    res.status(200).json(friendsList.rows);
});

//the most difficult query lol - But this helps suggest the users based on how actively they are reveiwing the movies
router.get('/users', verifyToken, async (req, res) => {
    const user_id = req.user.user_id;
    const users = await pool.query(
        `SELECT u.id, u.user_name, u.preferred_lang, COUNT(r.id) as total_reviews 
         FROM users u 
         LEFT JOIN ratings r ON u.id = r.user_id 
         WHERE u.id != $1 
         GROUP BY u.id 
         ORDER BY total_reviews DESC`,
        [user_id]
        // LEFT JOIN helps us find user with even total_review=0
    );
    res.status(200).json(users.rows);
});

router.delete('/:id', verifyToken, async (req, res) => {
    const deleteId = req.params.id;
    const user_id = req.user.user_id;
    const checkFriend = await pool.query('SELECT * FROM friends WHERE id=$1', [deleteId]);
    if (checkFriend.rows.length === 0) {
        return res.status(404).json({ message: "Friendship not found" });
    }
    if (checkFriend.rows[0].sender_id !== user_id && checkFriend.rows[0].receiver_id !== user_id) {
        return res.status(403).json({ message: "Not authorized" });
    }
    if (checkFriend.rows[0].status === 'pending') {
        const rejectFriend = await pool.query('DELETE FROM friends WHERE id=$1', [deleteId]);
        return res.status(200).json({ message: "Successfully Rejected" })
    }
    const deleteFriend = await pool.query('DELETE FROM friends WHERE id=$1', [deleteId]);
    res.status(200).json({ message: "Successfully Deleted" })
});

router.get('/sent', verifyToken, async (req, res) => {
    const sender_id = req.user.user_id;
    const sentRequests = await pool.query(
        'SELECT f.id, f.receiver_id, f.status, f.created_at, u.user_name, u.preferred_lang FROM friends f JOIN users u ON f.receiver_id = u.id WHERE f.sender_id = $1 AND f.status=$2',
        [sender_id, 'pending']
    );
    res.status(200).json(sentRequests.rows);
});

//fetch all the friends with accepted status

router.get('/friendlist', verifyToken, async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const friendList = await pool.query(`SELECT 
            CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END AS friend_id,
            u.user_name,
            u.preferred_lang
            FROM friends f
            JOIN users u ON u.id = CASE WHEN f.sender_id = $1 THEN f.receiver_id ELSE f.sender_id END
            WHERE (f.sender_id = $1 OR f.receiver_id = $1)
            AND f.status = 'accepted'`,
            [user_id]);
        if (friendList.rows.length === 0) {
            return res.status(200).json({ message: "No Friends" });
        }
        res.status(200).json(friendList.rows);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});


//get the favorite list from mutual friends 

router.get('/favorites/:id', verifyToken, async (req, res) => {
    const user_id = req.user.user_id;
    const friend_id = req.params.id;
    const getStatus = await pool.query(`SELECT status FROM friends 
                            WHERE ((sender_id = $1 AND receiver_id = $2) 
                            OR (sender_id = $2 AND receiver_id = $1))
                            AND status = 'accepted'`, [user_id, friend_id]);
    if (getStatus.rows.length === 0) {
        return res.status(403).json({ message: "Unauthorized user" });
    }
    const apiEndPoint = process.env.MOVIE_ID_ENDPOINT;
    const apiToken = process.env.API_TOKEN;
    try {
        const query = 'SELECT tmdb_movie_id from favorites WHERE user_id=$1';
        //Fetch movie from tmdb
        const fields = ['title', 'release_date', 'poster_path']

        const result = await pool.query(query, [friend_id]);
        const movies = result.rows;
        console.log(movies);
        const favMovies = await Promise.all(movies.map(async (movie) => {
            const ratings = await pool.query(
                'SELECT AVG(rating) as average_rating, COUNT(rating) as total_ratings, COUNT(review_text) as total_reviews FROM ratings WHERE tmdb_movie_id = $1',
                [movie.tmdb_movie_id]
            );
            const userReview = await pool.query('SELECT review_text,rating FROM ratings WHERE user_id = $1 AND tmdb_movie_id= $2', [friend_id, movie.tmdb_movie_id]);
            const url = `${apiEndPoint}/${movie.tmdb_movie_id}`
            const tmdbResponse = await axios.get(url, {
                headers: {
                    accept: 'application/json',
                    Authorization: `Bearer ${apiToken}`
                }
            });
            const movie_data = tmdbResponse.data
            const movieData = Object.fromEntries(Object.entries(movie_data).filter(([key]) => fields.includes(key)));
            return {
                ...movieData,
                tmdb_movie_id: movie.tmdb_movie_id,
                rating: parseFloat(ratings.rows[0].average_rating) || 0,
                total_ratings: parseInt(ratings.rows[0].total_ratings) || 0,
                total_reviews: parseInt(ratings.rows[0].total_reviews) || 0,
                user_review: userReview.rows[0] || null
            };
        }));

        res.status(200).json(favMovies);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message })
    }


});

// Delete friends table based on the user_id 

router.delete('/unfriend/:userId', verifyToken, async (req, res) => {
    const friendUserId = req.params.userId;
    const user_id = req.user.user_id;
    const result = await pool.query(
        'DELETE FROM friends WHERE ((sender_id=$1 AND receiver_id=$2) OR (sender_id=$2 AND receiver_id=$1)) AND status=$3',
        [user_id, friendUserId, 'accepted']
    );
    if (result.rowCount === 0) {
        return res.status(404).json({ message: "Friendship not found" });
    }
    res.status(200).json({ message: "Successfully Deleted" });
});


export default router;


