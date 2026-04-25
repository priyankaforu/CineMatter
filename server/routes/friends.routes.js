import express from 'express';
import pool from '../configs/db.js';
import verifyToken from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/send', verifyToken, async (req, res) => {
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

    const sendRequest = await pool.query('INSERT INTO friends(sender_id,receiver_id,status) VALUES($1,$2,$3) RETURNING *', [sender_id, receiver_id, 'pending']);
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
    const sender = await pool.query('SELECT user_name FROM users where id=$1', [checkStatus.rows[0].sender_id]);
    try {
        const updateStatus = await pool.query('UPDATE friends SET status=$1 WHERE id=$2 RETURNING *', ['accepted', friend_id]);
        return res.status(200).json({ message: `Friend request is accepted from ${sender.rows[0].user_name}`, updated: updateStatus.rows[0] });
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
});

router.get('/requests', verifyToken, async (req, res) => {
    const receiver_id = req.user.user_id;
    const requestedUsers = await pool.query('SELECT f.id,f.sender_id,f.created_at, u.user_name, u.preferred_lang FROM friends f JOIN users u ON f.sender_id=u.id WHERE receiver_id=$1 AND status=$2', [receiver_id, 'pending']);
    if (requestedUsers.rows.length === 0) {
        return res.status(400).json({ message: "No Friend Requests Yet" });
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
        const rejectFriend = await pool.query('DELETE * FROM friends WHERE id=$1', [deleteId]);
        return res.status(200).json({ message: "Successfully Rejected" })
    }
    const deleteFriend = await pool.query('DELETE FROM friends WHERE id=$1', [deleteId]);
    res.status(200).json({ message: "Successfully Deleted" })
});


export default router;


