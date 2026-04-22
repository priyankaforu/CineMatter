import express from 'express';
import pool from '../configs/db.js';
import axios from 'axios';

const router = express.Router();

router.post('/forgot', async (req, res) => {
    const { user_email } = req.body;
    const result = await pool.query('SELECT user_mail FROM users WHERE user_mail = $1', [user_email]);
    if (result.rows.length === 0) {
        res.status(404).json({ message: "Email not found" });
    }
    res.status(200).json({ message: "Found Email", email: result.rows[0] })

});

export default router;
